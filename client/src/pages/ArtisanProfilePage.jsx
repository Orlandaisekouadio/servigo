// Fiche publique d'un artisan — tout le contenu provient de l'API
// (GET /api/artisans/:slug) : identité, prestations, galerie, zones, avis,
// coordonnées. Aucune donnée de repli en dur : un artisan qui n'a rien renseigné
// affiche un état vide explicite plutôt qu'un texte emprunté à un autre profil.
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import GalleryBento from '../components/GalleryBento'
import FavouriteButton from '../components/FavouriteButton'
import { useFavorites } from '../auth/useFavorites'
import { assetUrl, getErrorMessage } from '../lib/api'
import { getPublicProfile } from '../services/artisanService'

// Numéro ivoirien : 10 chiffres à partir de 0, stocké sans indicatif.
const telHref = (phone) => `tel:+225${String(phone).replace(/^225/, '').replace(/\D/g, '')}`
const waHref = (phone) =>
  `https://wa.me/225${String(phone).replace(/^225/, '').replace(/\D/g, '')}`
const prettyPhone = (phone) => `+225 ${String(phone).replace(/^225/, '').replace(/(\d{2})(?=\d)/g, '$1 ')}`

function Stars({ rating }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  return (
    <span
      className="flex items-center gap-0.5 text-[#c2410c]"
      role="img"
      aria-label={`Note ${String(rating).replace('.', ',')} sur 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="material-symbols-outlined text-base" aria-hidden="true">
          {i < full || (half && i === full) ? (half && i === full ? 'star_half' : 'star') : 'star'}
        </span>
      ))}
    </span>
  )
}

const Empty = ({ children }) => (
  <p className="rounded-2xl border border-slate-200 bg-surface-container-low p-6 text-sm text-slate-500">
    {children}
  </p>
)

export default function ArtisanProfilePage() {
  const { slug } = useParams()
  const {
    isFavorite,
    toggle: toggleFavorite,
    pending: pendingFavorite,
    ready: favoritesReady,
    error: favoriteError,
  } = useFavorites()
  const [loadedSlug, setLoadedSlug] = useState(slug)
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [revealPhone, setRevealPhone] = useState(false)

  // Navigation vers une autre fiche : l'état est remis à zéro pendant le rendu,
  // pas depuis l'effet — sinon chaque changement de slug coûterait un rendu de
  // plus et afficherait brièvement la fiche précédente.
  if (loadedSlug !== slug) {
    setLoadedSlug(slug)
    setProfile(null)
    setError('')
    setLoading(true)
    setRevealPhone(false)
  }

  useEffect(() => {
    let cancelled = false
    getPublicProfile(slug)
      .then((res) => {
        if (!cancelled) setProfile(res?.data ?? null)
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-surface font-sans text-on-surface">
        <Navbar />
        <main className="mx-auto max-w-[1200px] px-4 py-16 text-center md:px-8">
          <p role="status" className="text-sm text-slate-500">
            Chargement de la fiche…
          </p>
        </main>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-surface font-sans text-on-surface">
        <Navbar />
        <main className="mx-auto max-w-[1200px] px-4 py-16 text-center md:px-8">
          <span className="material-symbols-outlined mb-3 text-5xl text-slate-300" aria-hidden="true">
            store</span>
          <h1 className="font-display mb-2 text-2xl font-bold">
            {error ? 'Fiche indisponible' : 'Artisan introuvable'}
          </h1>
          <p className="mb-6 text-sm text-slate-500">
            {error || "Cette fiche n'existe plus ou a été retirée de la vitrine."}
          </p>
          <Link
            to="/recherche"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold text-white transition-colors hover:bg-primary-deep"
          >
            Trouver un artisan
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const p = profile
  const gallery = p.gallery ?? []
  const zones = p.zones ?? []
  const reviews = p.reviews ?? []
  const services = p.services ?? []
  const phone = p.phone || p.whatsapp || ''
  const memberSince = new Date(p.createdAt).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-surface pb-24 font-sans text-on-surface antialiased lg:pb-0">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-4 py-8 md:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="mb-6 flex flex-wrap items-center gap-1 text-sm text-slate-500">
          <Link to="/" className="flex items-center rounded py-3 hover:text-primary">
            Accueil
          </Link>
          <span className="material-symbols-outlined text-base text-slate-300" aria-hidden="true">
            chevron_right
          </span>
          <Link to="/recherche" className="flex items-center rounded py-3 hover:text-primary">
            Trouver un artisan
          </Link>
          <span className="material-symbols-outlined text-base text-slate-300" aria-hidden="true">
            chevron_right
          </span>
          <span className="font-medium text-slate-800">{p.name}</span>
        </nav>

        {/* Hero card */}
        {p.coverUrl && (
          <div className="h-28 overflow-hidden rounded-t-2xl md:h-36">
            <img
              src={assetUrl(p.coverUrl)}
              alt={`Chantier réalisé par ${p.name}`}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <section
          className={`bg-white shadow-sm ${p.coverUrl ? 'rounded-b-2xl border border-t-0 border-slate-200' : 'rounded-2xl border border-slate-200'}`}
        >
          <div className="px-6 pb-6 md:px-10 md:pb-10">
            <div className={`flex flex-col items-start gap-4 md:flex-row md:items-end ${p.coverUrl ? '-mt-14 mb-5 md:-mt-16' : 'mb-5 pt-8'}`}>
              {p.avatarUrl ? (
                <img
                  src={assetUrl(p.avatarUrl)}
                  alt={p.name}
                  className="h-28 w-28 rounded-2xl border-4 border-white object-cover shadow-lg md:h-36 md:w-36"
                />
              ) : (
                <span
                  className="flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-white bg-primary-soft text-4xl font-bold text-primary-deep shadow-lg md:h-36 md:w-36"
                  aria-hidden="true"
                >
                  {p.name
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase()}
                </span>
              )}
              <div>
                <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                  {p.name}
                </h1>
                <div className="mt-3">
                  <FavouriteButton
                    slug={p.slug}
                    name={p.name}
                    variant="inline"
                    isFavorite={isFavorite(p.slug)}
                    onToggle={toggleFavorite}
                    pending={pendingFavorite}
                    ready={favoritesReady}
                  />
                </div>
                {favoriteError && (
                  <p role="alert" className="mt-2 text-sm text-amber-800">
                    Favori non enregistré : {favoriteError}
                  </p>
                )}
                {p.role && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                    <span className="material-symbols-outlined text-base" aria-hidden="true">
                      bolt
                    </span>
                    {p.role}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  {(p.location || p.commune) && (
                    <span className="flex items-center gap-1 text-sm text-slate-500">
                      <span className="material-symbols-outlined text-base" aria-hidden="true">
                        location_on
                      </span>
                      {p.location || p.commune}
                    </span>
                  )}
                  {p.reviewsCount > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Stars rating={p.rating} />
                      <span className="text-sm font-semibold text-slate-600">
                        {String(p.rating).replace('.', ',')} · {p.reviewsCount}{' '}
                        {p.reviewsCount > 1 ? 'avis' : 'avis'}
                      </span>
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {p.verified && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-deep">
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">
                        verified
                      </span>
                      Identité vérifiée
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                      p.available
                        ? 'bg-primary-soft text-primary-deep'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">
                      schedule
                    </span>
                    {p.availableLabel || (p.available ? 'Disponible' : 'Indisponible')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          {/* Colonne principale */}
          <div className="order-2 space-y-12 lg:order-1">
            {/* Présentation */}
            <section>
              <h2 className="font-display mb-4 flex items-center gap-2 text-2xl font-bold">
                <span className="material-symbols-outlined text-primary" aria-hidden="true">
                  description
                </span>
                Présentation
              </h2>
              {p.bio ? (
                <p className="leading-7 whitespace-pre-line text-slate-600">{p.bio}</p>
              ) : (
                <Empty>
                  {p.name} n&apos;a pas encore rédigé de présentation. Utilisez le contact
                  ci-contre pour en savoir plus sur son travail.
                </Empty>
              )}
            </section>

            {/* Spécialités */}
            {services.length > 0 && (
              <section>
                <h2 className="font-display mb-5 text-2xl font-bold">Spécialités &amp; Prestations</h2>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {services.map((s) => (
                    <div
                      key={s.slug ?? s._id}
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
                        <span className="material-symbols-outlined" aria-hidden="true">
                          {s.icon || 'handyman'}
                        </span>
                      </span>
                      <h3 className="font-display mb-2 text-lg font-bold">{s.name}</h3>
                      {s.description && (
                        <p className="text-sm leading-6 text-slate-500">{s.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Zones d'intervention */}
            {zones.length > 0 && (
              <section>
                <h2 className="font-display mb-5 text-2xl font-bold">
                  Zones d&apos;intervention
                </h2>
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {zones.map((z) => (
                    <li
                      key={z._id}
                      className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-primary" aria-hidden="true">
                        {z.icon || 'my_location'}
                      </span>
                      <div>
                        <p className="font-bold">{z.title}</p>
                        {z.text && <p className="mt-0.5 text-sm text-slate-500">{z.text}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Galerie */}
            <section>
              <h2 className="font-display mb-1 text-2xl font-bold">Galerie — chantiers récents</h2>
              <p className="mb-5 text-sm text-slate-500">
                Photos de ses réalisations récentes. Cliquez sur une photo pour l&apos;agrandir.
              </p>
              {gallery.length > 0 ? (
                <GalleryBento
                  items={gallery.map((g) => ({
                    photo: assetUrl(g.imageUrl),
                    title: g.title,
                    subtitle: g.subtitle || g.text || '',
                  }))}
                />
              ) : (
                <Empty>Aucune réalisation photographiée pour le moment.</Empty>
              )}
            </section>

            {/* Avis clients */}
            <section>
              <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold">Avis clients</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Retours de clients ayant fait appel à cet artisan.
                  </p>
                </div>
              </div>

              {reviews.length === 0 ? (
                <Empty>
                  {p.reviewsCount > 0
                    ? `Aucun de ses ${p.reviewsCount} avis n'est consultable ici : seuls les avis publiés directement sur ServiGo sont affichés sur cette page.`
                    : "Aucun avis publié pour le moment. Les avis laissés par les clients s'afficheront ici."}
                </Empty>
              ) : (
                <div className="space-y-5">
                  {reviews.map((r) => (
                    <article
                      key={r._id}
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft font-bold text-primary-deep">
                            {(r.authorName || '?').slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <p className="font-bold">{r.authorName}</p>
                            {r.location && <p className="text-xs text-slate-500">{r.location}</p>}
                          </div>
                        </div>
                        <Stars rating={r.rating} />
                      </div>
                      <p className="text-sm leading-6 text-slate-600">{r.text}</p>
                      {r.service && (
                        <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary">
                          <span className="material-symbols-outlined text-sm" aria-hidden="true">
                            handyman
                          </span>
                          Prestation : {r.service}
                        </p>
                      )}
                    </article>
                  ))}
                  {/* Le total affiché en tête de page est l'ancienneté de
                      l'artisan : on ne laisse pas croire que la liste est
                      complète quand elle ne l'est pas. */}
                  {p.reviewsCount > reviews.length && (
                    <p className="text-sm text-slate-500">
                      {p.reviewsCount - reviews.length} avis antérieurs ne sont pas
                      consultables en ligne.
                    </p>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Colonne latérale — contact (remontée sur mobile) */}
          <aside className="order-1 space-y-6 lg:order-2">
            {/* Carte contact */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              {p.available && (
                <div className="mb-4 flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                  </span>
                  <span className="text-sm font-bold text-primary-deep">
                    {p.availableLabel || 'Disponible'}
                  </span>
                </div>
              )}
              <h2 className="font-display mb-1 text-xl font-bold">Contacter {p.name}</h2>
              <p className="mb-5 text-sm text-slate-500">
                Contactez l&apos;artisan directement par téléphone ou WhatsApp.
              </p>

              {phone ? (
                <>
                  {revealPhone ? (
                    <a
                      href={telHref(phone)}
                      className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-white transition-colors hover:bg-primary-deep"
                    >
                      <span className="material-symbols-outlined text-lg" aria-hidden="true">
                        call
                      </span>
                      {prettyPhone(phone)}
                    </a>
                  ) : (
                    <button
                      onClick={() => setRevealPhone(true)}
                      className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-white transition-colors hover:bg-primary-deep"
                    >
                      <span className="material-symbols-outlined text-lg" aria-hidden="true">
                        call
                      </span>
                      Afficher le numéro
                    </button>
                  )}
                  {p.whatsapp && (
                    <a
                      href={waHref(p.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#075e54] py-3 font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      <span className="material-symbols-outlined text-lg" aria-hidden="true">
                        chat
                      </span>
                      WhatsApp
                    </a>
                  )}
                </>
              ) : (
                <Empty>
                  Cet artisan n&apos;a pas encore publié de coordonnées. Revenez plus tard ou
                  contactez-le via le formulaire du site.
                </Empty>
              )}

              <div className="mt-5 rounded-xl bg-primary-soft/60 p-4">
                <p className="mb-1 flex items-center gap-2 text-sm font-bold text-primary-deep">
                  <span className="material-symbols-outlined text-base" aria-hidden="true">
                    info
                  </span>
                  Paiement
                </p>
                <p className="text-sm leading-6 text-slate-600">
                  {p.paymentMeans?.length
                    ? `Moyens annoncés : ${p.paymentMeans.join(', ')}.`
                    : 'Les modalités de paiement se règlent directement avec l’artisan, après accord.'}{' '}
                  ServiGo ne détient jamais vos fonds et n&apos;intervient pas dans le règlement.
                </p>
              </div>
            </div>

            {/* Informations pratiques */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-display mb-4 text-lg font-bold">Informations du profil</h2>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary" aria-hidden="true">
                    calendar_month
                  </span>
                  <span>
                    <span className="block font-semibold">Membre depuis</span>
                    <span className="text-slate-500">{memberSince}</span>
                  </span>
                </li>
                {services[0] && (
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary" aria-hidden="true">
                      handyman
                    </span>
                    <span>
                      <span className="block font-semibold">Métier principal</span>
                      <span className="text-slate-500">{services[0].name}</span>
                    </span>
                  </li>
                )}
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary" aria-hidden="true">
                    receipt_long
                  </span>
                  <span>
                    <span className="block font-semibold">Facture</span>
                    <span className="text-slate-500">Demandez-la à l&apos;artisan</span>
                  </span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      {/* Barre d'action mobile persistante */}
      {phone && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-[1200px] gap-3">
            <a
              href={telHref(phone)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-deep"
            >
              <span className="material-symbols-outlined text-base" aria-hidden="true">
                call
              </span>
              Appeler
            </a>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}