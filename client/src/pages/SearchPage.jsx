import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { COMMUNES, METIERS, searchArtisans } from '../data/search'
import { Stagger } from '../components/motion'
import { itemVariants } from '../components/variants'
import Navbar from '../components/Navbar'

const SORTS = [
  { key: 'booked', label: 'Les plus réservés' },
  { key: 'rating', label: 'Les mieux notés' },
  { key: 'new', label: 'Nouveaux artisans' },
]

function communeOf(a) {
  const loc = a.location.toLowerCase()
  const found = COMMUNES.slice(1).find((c) =>
    loc.includes(c.split('/')[0].trim().toLowerCase().replace(/-/g, ' ')) ||
    loc.includes(c.split('/')[0].trim().toLowerCase()),
  )
  return found || 'Autre'
}

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [metier, setMetier] = useState(() => {
    const m = searchParams.get('metier')
    return m && METIERS.includes(m) ? m : 'Tous les métiers'
  })
  const [commune, setCommune] = useState(() => {
    const c = searchParams.get('commune')
    return c && COMMUNES.includes(c) ? c : 'Toutes les communes'
  })
  const [minNote, setMinNote] = useState(0)
  const [sortKey, setSortKey] = useState('booked')
  const [sortOpen, setSortOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const sortBtnRef = useRef(null)

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = searchArtisans.filter((a) => {
      if (availableOnly && !a.available) return false
      if (metier !== 'Tous les métiers' && a.metier !== metier) return false
      if (commune !== 'Toutes les communes' && communeOf(a) !== commune) return false
      if (a.rating < minNote) return false
      if (
        q &&
        !`${a.name} ${a.role} ${a.metier} ${a.location}`.toLowerCase().includes(q)
      )
        return false
      return true
    })
    list = [...list].sort((x, y) => {
      if (sortKey === 'rating') return y.rating - x.rating
      if (sortKey === 'new') return y.id - x.id
      return y.reviews - x.reviews
    })
    return list
  }, [query, availableOnly, metier, commune, minNote, sortKey])

  const chips = []
  if (metier !== 'Tous les métiers')
    chips.push({ label: metier, clear: () => setMetier('Tous les métiers') })
  if (commune !== 'Toutes les communes')
    chips.push({ label: commune, clear: () => setCommune('Toutes les communes') })
  if (availableOnly)
    chips.push({ label: 'Disponible de suite', clear: () => setAvailableOnly(false) })
  if (minNote > 0)
    chips.push({ label: `Note ≥ ${minNote}`, clear: () => setMinNote(0) })

  const resetAll = () => {
    setQuery('')
    setAvailableOnly(false)
    setMetier('Tous les métiers')
    setCommune('Toutes les communes')
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
                  {METIERS.map((m) => (
                    <label
                      key={m}
                      className="flex cursor-pointer items-center gap-3 text-[15px] text-slate-600"
                    >
                      <input
                        type="radio"
                        name="metier"
                        checked={metier === m}
                        onChange={() => setMetier(m)}
                        className="h-5 w-5 accent-[#15803d]"
                      />
                      {m}
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
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    aria-label="Choisir une commune"
                    className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-[15px] text-slate-600 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {COMMUNES.map((c) => (
                      <option key={c}>{c}</option>
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

            <h1 className="mb-1 text-2xl font-bold tracking-tight md:text-[28px]">
              Artisans vérifiés à Abidjan
            </h1>
            <p className="mb-8 text-[15px] text-slate-500">
              {filtered.length} artisan{filtered.length > 1 ? 's' : ''} correspond
              {filtered.length > 1 ? 'ent' : ''} à vos critères
            </p>

            {filtered.length === 0 ? (
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
                {filtered.map((a) => (
                  <motion.article
                    key={a.id}
                    variants={itemVariants}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
                  >
                    <div className="relative">
                      <img src={a.avatar} alt={a.name} loading="lazy" className="h-64 w-full object-cover" />
                      <span
                        className={`absolute top-4 left-4 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-white shadow ${
                          a.available ? 'bg-primary' : 'bg-accent'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm" aria-hidden="true">verified</span>
                        {a.available ? 'Disponible' : a.availableLabel}
                      </span>
                    </div>
                    <div className="p-7">
                      <h2 className="text-xl font-bold">{a.name}</h2>
                      <p className="mt-1 text-sm text-slate-500">{a.role}</p>
                      <p className="mt-3 flex items-center gap-1.5 text-[15px]">
                        <span className="material-symbols-outlined text-lg text-accent" aria-hidden="true">star</span>
                        <span className="font-bold">{a.rating}</span>
                        <span className="text-slate-500">({a.reviews} avis)</span>
                        <span className="sr-only">Note {a.rating} sur 5</span>
                      </p>
                      <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
                        <span className="material-symbols-outlined text-base" aria-hidden="true">location_on</span>
                        {a.location}
                      </p>
                      <Link
                        to={`/artisan/${a.slug}`}
                        className="mt-5 flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 font-semibold text-white transition-colors hover:bg-primary-deep"
                      >
                        Voir le profil
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </Stagger>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant/30 bg-surface-container-low">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-4 py-14 md:grid-cols-4 md:px-8">
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-2 text-xl font-extrabold text-primary-deep">
              <span className="material-symbols-outlined" aria-hidden="true">home_repair_service</span>
              ServiGo
            </div>
            <p className="text-sm leading-relaxed text-slate-500">
              La première plateforme de mise en relation de confiance avec les artisans qualifiés en
              Côte d&apos;Ivoire.
            </p>
            <p className="mt-4 text-sm font-medium text-slate-600">Abidjan, Côte d&apos;Ivoire</p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-bold tracking-wider uppercase">Découvrir</h3>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li>
                <Link to="/recherche" className="hover:text-primary">
                  Trouver un artisan
                </Link>
              </li>
              <li>
                <Link to="/#services" className="hover:text-primary">
                  Toutes les catégories
                </Link>
              </li>
              <li>
                <Link to="/#comment" className="hover:text-primary">
                  Comment ça marche
                </Link>
              </li>
              <li>Grille tarifaire</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-bold tracking-wider uppercase">Professionnels</h3>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li>
                <Link to="/devenir-artisan" className="hover:text-primary">
                  Devenir artisan
                </Link>
              </li>
              <li>Charte de qualité</li>
              <li>Espace Pro ServiGo</li>
              <li>
                <Link to="/connexion" className="hover:text-primary">
                  Centre d&apos;assistance
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-bold tracking-wider uppercase">Contact & Légal</h3>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li>Contactez-nous</li>
              <li>Mentions légales</li>
              <li>Politique de confidentialité</li>
              <li>Conditions d&apos;utilisation</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200">
          <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500 md:flex-row md:px-8">
            <p>© 2025 ServiGo CI. Tous droits réservés.</p>
            <p className="font-medium text-primary-deep">Construit pour l&apos;artisanat ivoirien</p>
          </div>
        </div>
      </footer>
    </div>
  )
}