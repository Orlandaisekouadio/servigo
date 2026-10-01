// Panneau « Artisans favoris » (client) — grille de cartes façon vitrine,
// construite à partir d'artisans réels du site, retrait en mémoire (démo).
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { searchArtisans } from '../../data/search'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Badge } from '../../components/ui/badge'
import Stars from '../../components/dashboard/Stars'

const START = ['mamadou-kone', 'maitre-yao', 'bakary-sangare']

// Visuels de la vitrine (photos d'illustration déjà utilisées sur le site),
// jamais présentés comme des réalisations des artisans.
const COVERS = {
  'mamadou-kone': { photo: '/images/plomberie.jpg', service: 'Dépannage plomberie' },
  'maitre-yao': { photo: '/images/menuiserie.jpg', service: 'Agencement bois sur mesure' },
  'bakary-sangare': { photo: '/images/peinture.jpg', service: 'Peinture et finition' },
  'koffi-amani': { photo: '/images/electricite.jpg', service: 'Dépannage électrique' },
  'ibrahim-cisse': { photo: '/images/climatisation.jpg', service: 'Climatisation et froid' },
  'gerard-ngoran': { photo: '/images/maconnerie.jpg', service: 'Maçonnerie et rénovation' },
}

const SORTS = [
  { key: 'recent', label: 'Ajoutés récemment' },
  { key: 'rating', label: 'Les mieux notés' },
  { key: 'name', label: 'Nom de A à Z' },
]

const initials = (name) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')

export default function FavoritesPanel() {
  const [favorites, setFavorites] = useState(() =>
    searchArtisans.filter((a) => START.includes(a.slug)),
  )
  const [sortKey, setSortKey] = useState('recent')

  const sorted = useMemo(() => {
    const list = [...favorites]
    if (sortKey === 'rating') list.sort((a, b) => b.rating - a.rating)
    if (sortKey === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'fr'))
    return list
  }, [favorites, sortKey])

  const remove = (slug) => setFavorites((list) => list.filter((a) => a.slug !== slug))

  if (favorites.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm md:p-10">
        <span
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft"
          aria-hidden="true"
        >
          <span className="material-symbols-outlined text-3xl text-primary">favorite_border</span>
        </span>
        <p className="mt-4 text-lg font-bold text-on-surface">Aucun favori pour l&apos;instant</p>
        <p className="mt-1 text-sm text-on-surface-variant">
          Explorez la recherche et enregistrez des artisans de confiance près de chez vous.
        </p>
        <Link
          to="/recherche"
          className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-deep"
        >
          Trouver un artisan
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            arrow_forward
          </span>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold tracking-tight text-on-surface">
          Favoris{' '}
          <Badge variant="neutral" className="ml-1 align-middle">
            {sorted.length}
          </Badge>
        </h2>
        <div className="flex items-center gap-2">
          <label htmlFor="fav-sort" className="text-sm font-medium text-slate-500">
            Trier
          </label>
          <div className="relative">
            <select
              id="fav-sort"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="min-h-11 appearance-none rounded-xl border border-slate-200 bg-white py-2 pr-9 pl-3 text-sm font-medium text-slate-700"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
            <span
              className="material-symbols-outlined pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-base text-slate-500"
              aria-hidden="true"
            >
              expand_more
            </span>
          </div>
        </div>
      </div>

      <p className="mb-4 text-sm text-on-surface-variant">
        Favoris préchargés depuis des artisans présents sur la vitrine (démo). Le retrait
        fonctionne en mémoire jusqu&apos;au rechargement.
      </p>

      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {sorted.map((a) => {
          const cover = COVERS[a.slug] ?? { photo: a.avatar, service: a.role }
          return (
            <li
              key={a.slug}
              className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-shadow hover:shadow-floating"
            >
              <div className="relative">
                <img
                  src={cover.photo}
                  alt=""
                  loading="lazy"
                  className="h-44 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => remove(a.slug)}
                  aria-label={`Retirer ${a.name} des favoris`}
                  title="Retirer des favoris (démo)"
                  className="absolute top-3 left-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-primary shadow-sm transition-colors hover:bg-white"
                >
                  <span className="material-symbols-outlined text-xl" aria-hidden="true">
                    favorite
                  </span>
                </button>
                <span className="absolute top-3 right-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                  {a.metier}
                </span>
              </div>
              <div className="p-4">
                <p className="truncate text-sm font-bold text-on-surface">{cover.service}</p>
                <div className="mt-3 flex items-center gap-2.5">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={a.avatar} alt={`Portrait de ${a.name}`} />
                    <AvatarFallback>{initials(a.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-on-surface">{a.name}</p>
                    <p className="flex items-center gap-1 truncate text-xs text-slate-500">
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">
                        location_on
                      </span>
                      {a.location}
                    </p>
                  </div>
                  <Link
                    to={`/artisan/${a.slug}`}
                    className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-primary-soft hover:text-primary-deep"
                  >
                    Voir le profil
                  </Link>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-on-surface-variant">
                  <Stars rating={a.rating} />
                  <span>
                    {a.rating} sur 5 · {a.reviews} avis
                  </span>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="mt-6 flex flex-col gap-2 rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p>
          Affichage de {sorted.length} favori{sorted.length > 1 ? 's' : ''} (démo)
        </p>
        <p className="text-xs text-slate-500">
          Photos d&apos;illustration du site, aucune correspondance garantie.
        </p>
      </div>
    </div>
  )
}
