import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { Stagger } from '../components/motion'
import { itemVariants } from '../components/variants'
import Navbar from '../components/Navbar'
import { getErrorMessage } from '../lib/api'
import { noteFr } from '../lib/format'
import { useFavorites } from '../auth/useFavorites'
import ArtisanCard from '../components/ArtisanCard'
import Footer from '../components/Footer'
import { useCommunes, useServices } from '../hooks/useReferentials'
import { listArtisans } from '../services/artisanService'

const ALL_COMMUNES = 'Toutes les communes'
const ALL_METIERS = 'Tous les métiers'

const SORTS = [
  { key: 'reviews', label: 'Les plus réservés' },
  { key: 'rating', label: 'Les mieux notés' },
  { key: 'new', label: 'Nouveaux artisans' },
]



export default function SearchPage() {
  const [searchParams] = useSearchParams()
  // Une seule lecture des favoris pour toute la page : les cartes n'en relancent pas.
  const {
    isFavorite,
    toggle: toggleFavorite,
    pending: pendingFavorite,
    ready: favoritesReady,
    error: favoriteError,
  } = useFavorites()
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '')
  const [availableOnly, setAvailableOnly] = useState(false)
  // Métiers et communes : administrables, donc lus depuis l'API. Le filtre métier
  // porte sur le slug construit par le serveur — le client ne le devine pas.
  const { valeur: metiers, chargement: metiersChargement, erreur: metiersErreur } = useServices()
  const { valeur: communes, chargement: communesChargement, erreur: communesErreur } = useCommunes()

  // Les paramètres d'URL sont repris tels quels, y compris s'ils sont invalides : le
  // catalogue arrive en asynchrone, les valider à l'initialisation reviendrait à
  // rejeter des valeurs parfaitement bonnes.
  const [metier, setMetier] = useState(() => searchParams.get('metier') ?? ALL_METIERS)
  const [commune, setCommune] = useState(() => searchParams.get('commune') ?? ALL_COMMUNES)

  const nomsCommunes = useMemo(() => communes.map((c) => c.name), [communes])

  // Réconciliation des paramètres d'URL une fois le catalogue connu, dérivée
  // pendant le rendu et non corrigée par un effet : un métier ou une commune
  // retirés du catalogue donnaient sinon une page « aucun artisan trouvé » sans
  // explication, le filtre restant actif mais invisible. Un filtre abandonné est
  // annoncé plutôt que silencieusement effacé.
  //
  // Tant que le catalogue n'est pas chargé, la valeur reçue est reprise telle
  // quelle : une liste vide ne prouve pas qu'un métier est inconnu.
  const catalogueConnu = !metiersChargement && !communesChargement
  // Chaque filtre est jugé séparément : un métier périmé ne doit pas entraîner
  // la zone, qui elle est valide, dans le même abandon.
  const metierPerime =
    catalogueConnu && metiers.length > 0 && metier !== ALL_METIERS && !metiers.some((m) => m.name === metier)
  const communePerimee =
    catalogueConnu && nomsCommunes.length > 0 && commune !== ALL_COMMUNES && !nomsCommunes.includes(commune)

  const abandon = useMemo(() => {
    const inconnus = []
    if (metierPerime) inconnus.push(`le métier « ${metier} »`)
    if (communePerimee) inconnus.push(`la zone « ${commune} »`)
    return inconnus.length
      ? `${inconnus.join(' et ')} ne fait plus partie du catalogue : filtre retiré.`
      : ''
  }, [metierPerime, communePerimee, metier, commune])

  const metierActif = metierPerime ? ALL_METIERS : metier
  const communeActive = communePerimee ? ALL_COMMUNES : commune
  const [minNote, setMinNote] = useState(0)
  const [sortKey, setSortKey] = useState('reviews')
  const [sortOpen, setSortOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const sortBtnRef = useRef(null)

  // Résultats et état de lecture : la liste affichée vient de l'API. Les trois
  // champs sont rangés ensemble avec la clé de requête qui les a produits, ce qui
  // permet de déduire `loading` pendant le rendu au lieu de le remettre à vrai
  // depuis l'effet (ce qui coûterait un rendu supplémentaire à chaque frappe).
  const [state, setState] = useState({ key: null, results: [], total: 0, error: '' })
  // La saisie est différée : une requête par frappe sur le clavier saturerait
  // l'API pour rien.
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 250)
    return () => clearTimeout(id)
  }, [query])

  const serviceSlug = useMemo(
    () => metiers.find((m) => m.name === metierActif)?.slug ?? '',
    [metiers, metierActif],
  )

  // Incrémenté par le bouton « Réessayer » pour relancer la requête à l'identique.
  const [retry, setRetry] = useState(0)

  const requestKey = JSON.stringify([
    debouncedQuery.trim(),
    serviceSlug,
    communeActive,
    minNote,
    availableOnly,
    sortKey,
    retry,
  ])
  const loading = state.key !== requestKey
  const results = state.results
  const total = state.total
  const loadError = state.error

  useEffect(() => {
    let cancelled = false
    listArtisans({
      q: debouncedQuery.trim(),
      service: serviceSlug,
      commune: communeActive === ALL_COMMUNES ? '' : communeActive,
      minNote,
      disponible: availableOnly ? true : undefined,
      sort: sortKey,
      limit: 50,
    })
      .then((res) => {
        if (!cancelled) {
          setState({
            key: requestKey,
            results: res?.data ?? [],
            total: res?.total ?? 0,
            error: '',
          })
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setState({ key: requestKey, results: [], total: 0, error: getErrorMessage(err) })
        }
      })
    return () => {
      cancelled = true
    }
    // `requestKey` est la synthèse des cinq critères ci-dessus : les lister
    // aussi ne déclenche aucun passage de plus, la clé changeant déjà avec eux.
  }, [debouncedQuery, serviceSlug, communeActive, minNote, availableOnly, sortKey, requestKey])

  useEffect(() => {
    if (!sortOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setSortOpen(false)
        sortBtnRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [sortOpen])

  const chips = []
  if (metierActif !== ALL_METIERS)
    chips.push({ label: metierActif, clear: () => setMetier(ALL_METIERS) })
  if (communeActive !== ALL_COMMUNES)
    chips.push({ label: communeActive, clear: () => setCommune(ALL_COMMUNES) })
  if (availableOnly)
    chips.push({ label: 'Disponible de suite', clear: () => setAvailableOnly(false) })
  if (minNote > 0)
    chips.push({ label: `Note ≥ ${noteFr(minNote, 0)}`, clear: () => setMinNote(0) })

  const resetAll = () => {
    setQuery('')
    setAvailableOnly(false)
    setMetier(ALL_METIERS)
    setCommune(ALL_COMMUNES)
    setMinNote(0)
  }

  const sortLabel = SORTS.find((s) => s.key === sortKey).label

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface antialiased">
      <Navbar />

      <main className="mx-auto w-full max-w-[1440px] px-4 py-10 md:px-10 md:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Sidebar filtres */}
          <aside
            className={`${filtersOpen ? 'block' : 'hidden'} lg:block`}
            aria-label="Filtres de recherche"
          >
            <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm lg:sticky lg:top-28">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Filtres</h2>
                <button
                  onClick={resetAll}
                  className="text-sm font-semibold text-slate-500 hover:text-primary"
                >
                  Réinitialiser
                </button>
              </div>

              {/* Un référentiel illisible ne se devine pas : on le dit au lieu de
                  laisser une liste de métiers ou de communes à moitié vide. */}
              {(metiersErreur || communesErreur) && (
                <p
                  role="alert"
                  className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700"
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    cloud_off
                  </span>
                  {metiersErreur || communesErreur}
                </p>
              )}

              {/* Filtre arrivé par l'URL mais retiré du catalogue depuis. */}
              {abandon && (
                <p
                  role="status"
                  className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800"
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    info
                  </span>
                  {abandon}
                </p>
              )}

              {/* Disponibilité */}
              <label className="flex cursor-pointer items-center justify-between gap-3">
                <span className="flex items-center gap-2.5 text-[15px] font-medium text-slate-700">
                  <span className="material-symbols-outlined text-primary" aria-hidden="true">schedule</span>
                  Disponible de suite
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={availableOnly}
                  aria-label="Disponible de suite"
                  onClick={() => setAvailableOnly(!availableOnly)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                    availableOnly ? 'bg-primary' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                      availableOnly ? 'left-6' : 'left-1'
                    }`}
                  ></span>
                </button>
              </label>

              {/* Métier */}
              <div>
                <h3 className="mb-4 text-[15px] font-bold">Nos catégories</h3>
                <div className="space-y-3.5">
                  <label className="flex cursor-pointer items-center gap-3 text-[15px] text-slate-600">
                    <input
                      type="radio"
                      name="metier"
                      checked={metierActif === ALL_METIERS}
                      onChange={() => setMetier(ALL_METIERS)}
                      className="h-5 w-5 accent-[#15803d]"
                    />
                    {ALL_METIERS}
                  </label>
                  {metiers.map((m) => (
                    <label
                      key={m.slug}
                      className="flex cursor-pointer items-center gap-3 text-[15px] text-slate-600"
                    >
                      <input
                        type="radio"
                        name="metier"
                        checked={metierActif === m.name}
                        onChange={() => setMetier(m.name)}
                        className="h-5 w-5 accent-[#15803d]"
                      />
                      {m.name}
                    </label>
                  ))}
                </div>
              </div>

              {/* Note minimale */}
              <div>
                <h3 className="mb-4 text-[15px] font-bold">Note minimale</h3>
                <div className="space-y-3.5">
                  {[
                    { value: 0, label: 'Toutes les notes' },
                    { value: 4.5, label: '4.5+ étoiles' },
                    { value: 4.0, label: '4.0+ étoiles' },
                  ].map((n) => (
                    <label
                      key={n.label}
                      className="flex cursor-pointer items-center gap-3 text-[15px] text-slate-600"
                    >
                      <input
                        type="radio"
                        name="note"
                        checked={minNote === n.value}
                        onChange={() => setMinNote(n.value)}
                        className="h-5 w-5 accent-[#15803d]"
                      />
                      {n.value > 0 && (
                        <span className="material-symbols-outlined text-lg text-accent" aria-hidden="true">star</span>
                      )}
                      {n.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Localisation */}
              <div>
                <h3 className="mb-4 text-[15px] font-bold">Localisation</h3>
                <div className="relative">
                  <select
                    value={communeActive}
                    onChange={(e) => setCommune(e.target.value)}
                    aria-label="Choisir une commune"
                    className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-[15px] text-slate-600 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value={ALL_COMMUNES}>{ALL_COMMUNES}</option>
                    {nomsCommunes.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-slate-500" aria-hidden="true">
                    expand_more
                  </span>
                </div>
              </div>

              </div>
          </aside>

          {/* Résultats */}
          <div>
            {/* Barre recherche + tri */}
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative min-w-0 flex-1 md:max-w-[512px]">
                <span className="material-symbols-outlined absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" aria-hidden="true">
                  search
                </span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Rechercher un artisan, un métier, une commune"
                  placeholder="Rechercher un artisan, un métier..."
                  className="h-13 w-full rounded-xl border border-slate-200 bg-white py-3.5 pr-4 pl-12 text-[15px] shadow-sm outline-none placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] font-medium shadow-sm lg:hidden"
                >
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">tune</span>
                  Filtres
                </button>
                <span className="hidden text-[15px] text-slate-500 sm:block">Trier par :</span>
                <div className="relative">
                  <button
                    ref={sortBtnRef}
                    onClick={() => setSortOpen(!sortOpen)}
                    className="flex min-h-13 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] font-medium shadow-sm transition-colors hover:border-slate-300"
                    aria-haspopup="listbox"
                    aria-expanded={sortOpen}
                  >
                    {sortLabel}
                    <span className="material-symbols-outlined text-lg text-slate-500" aria-hidden="true">
                      keyboard_arrow_down
                    </span>
                  </button>
                  {sortOpen && (
                    <>
                      <button
                        aria-hidden="true"
                        tabIndex={-1}
                        onClick={() => setSortOpen(false)}
                        className="fixed inset-0 z-10 cursor-default"
                      />
                      <div
                        role="listbox"
                        className="absolute top-full right-0 z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-xl"
                      >
                      {SORTS.map((s) => (
                        <button
                          key={s.key}
                          role="option"
                          aria-selected={sortKey === s.key}
                          onClick={() => {
                            setSortKey(s.key)
                            setSortOpen(false)
                          }}
                          className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[15px] transition-colors hover:bg-slate-50 ${
                            sortKey === s.key ? 'font-semibold text-primary' : 'text-slate-600'
                          }`}
                        >
                          {s.label}
                          {sortKey === s.key && (
                            <span className="material-symbols-outlined" aria-hidden="true">check</span>
                          )}
                        </button>
                      ))}
                    </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Filtres actifs */}
            {chips.length > 0 && (
              <div className="mb-6 flex flex-wrap items-center gap-2.5 rounded-xl bg-slate-100/70 px-4 py-3">
                <span className="text-sm font-medium text-slate-500">Filtres actifs :</span>
                {chips.map((c) => (
                  <span
                    key={c.label}
                    className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-slate-700 shadow-sm"
                  >
                    {c.label}
                    <button
                      onClick={c.clear}
                      aria-label={`Retirer ${c.label}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-200 hover:text-primary"
                    >
                      <span className="material-symbols-outlined text-base" aria-hidden="true">close</span>
                    </button>
                  </span>
                ))}
                <button
                  onClick={resetAll}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Effacer tout
                </button>
              </div>
            )}

            {/* Les favoris échouent indépendamment de la recherche : le cœur est
                revenu à son état d'origine, on le dit sans masquer les résultats. */}
            {favoriteError && (
              <p role="alert" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-900">
                Favori non enregistré : {favoriteError}
              </p>
            )}

            <h1 className="mb-1 text-2xl font-bold tracking-tight md:text-[28px]">
              Artisans disponibles à Abidjan
            </h1>
            <p aria-live="polite" className="mb-8 text-[15px] text-slate-500">
              {loading
                ? 'Recherche en cours…'
                : `${total} artisan${total > 1 ? 's' : ''} correspond${
                    total > 1 ? 'ent' : ''
                  } à vos critères`}
              {/* La page remonte 50 profils à la fois : au-delà, on ne présente pas
                  le total comme s'il était entièrement visible. */}
              {!loading && total > results.length && (
                <> — affichage des {results.length} premiers</>
              )}
            </p>

            {loadError ? (
              <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-12 text-center">
                <span className="material-symbols-outlined mb-3 text-5xl text-red-400" aria-hidden="true">
                  cloud_off
                </span>
                <p className="text-lg font-bold">Recherche indisponible</p>
                <p className="mt-1 text-[15px] text-slate-600">{loadError}</p>
                <button
                  onClick={() => setRetry((n) => n + 1)}
                  className="mt-5 rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:border-primary hover:text-primary"
                >
                  Réessayer
                </button>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    aria-hidden="true"
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="h-64 w-full animate-pulse bg-slate-100" />
                    <div className="space-y-3 p-7">
                      <div className="h-5 w-1/2 animate-pulse rounded bg-slate-100" />
                      <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" />
                      <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <span className="material-symbols-outlined mb-3 text-5xl text-slate-300" aria-hidden="true">
                  person_search
                </span>
                <p className="text-lg font-bold">Aucun artisan trouvé</p>
                <p className="mt-1 text-[15px] text-slate-500">
                  Essayez d&apos;élargir vos critères de recherche.
                </p>
                <button
                  onClick={resetAll}
                  className="mt-5 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-deep"
                >
                  Effacer les filtres
                </button>
              </div>
            ) : (
              <Stagger className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                {results.map((a) => (
                  <motion.div key={a._id} variants={itemVariants} className="h-full">
                    <ArtisanCard
                      artisan={a}
                      favourite={{
                        isFavorite: isFavorite(a.slug),
                        onToggle: toggleFavorite,
                        pending: pendingFavorite,
                        ready: favoritesReady,
                      }}
                    />
                  </motion.div>
                ))}
              </Stagger>
            )}
          </div>
        </div>
      </main>

      {/* Le pied de page est commun à toutes les pages : cette copie
          locale avait son propre logotype, sa propre accroche et des liens
          morts (« Grille tarifaire », « Mentions légales »…). */}
      <Footer />
    </div>
  )
}