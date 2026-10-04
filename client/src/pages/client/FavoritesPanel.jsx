// Panneau « Artisans favoris » (client) — liste et retraits passent par
// GET /api/favorites et DELETE /api/favorites/:artisanId : chaque compte voit
// ses propres favoris, pas une sélection figée dans le code.
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Badge } from '../../components/ui/badge'
import Stars from '../../components/dashboard/Stars'
import { assetUrl, getErrorMessage } from '../../lib/api'
import { listFavorites, removeFavorite } from '../../services/socialService'

const SORTS = [
  { key: 'recent', label: 'Ajoutés récemment' },
  { key: 'rating', label: 'Les mieux notés' },
  { key: 'name', label: 'Nom de A à Z' },
]

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

export default function FavoritesPanel() {
  const [favorites, setFavorites] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState('recent')

  useEffect(() => {
    let cancelled = false
    listFavorites()
      .then((res) => {
        if (!cancelled) setFavorites(res?.data ?? [])
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
  }, [])

  const sorted = useMemo(() => {
    // `recent` respecte l'ordre de l'API (favori le plus récent en tête).
    const list = [...favorites]
    if (sortKey === 'rating') {
      list.sort((a, b) => (b.artisan?.rating ?? 0) - (a.artisan?.rating ?? 0))
    }
    if (sortKey === 'name') {
      list.sort((a, b) => (a.artisan?.name ?? '').localeCompare(b.artisan?.name ?? '', 'fr'))
    }
    return list
  }, [favorites, sortKey])

  const remove = async (fav) => {
    setError('')
    const previous = favorites
    setFavorites((list) => list.filter((f) => f._id !== fav._id))
    try {
      const res = await removeFavorite(fav.artisan?._id)
      if (!res?.ok) throw new Error(res?.message || 'Retrait impossible.')
    } catch (err) {
      setFavorites(previous)
      setError(getErrorMessage(err))
    }
  }

  if (loading) {
    return (
      <p role="status" className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        Chargement de vos favoris…
      </p>
    )
  }

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
        {error && (
          <p role="alert" className="mt-3 text-sm font-medium text-error">
            {error}
          </p>
        )}
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

      {error && (
        <p role="alert" className="mb-4 flex items-center gap-1.5 text-sm font-medium text-error">
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            error
          </span>
          {error}
        </p>
      )}

      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {sorted.map((fav) => {
          const a = fav.artisan
          if (!a) return null
          return (
            <li
              key={fav._id}
              className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-shadow hover:shadow-floating"
            >
              <div className="relative">
                {a.avatarUrl ? (
                  <img
                    src={assetUrl(a.avatarUrl)}
                    alt=""
                    loading="lazy"
                    className="h-44 w-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-44 w-full items-center justify-center bg-surface-container-low"
                    aria-hidden="true"
                  >
                    <span className="material-symbols-outlined text-5xl text-slate-300">
                      store
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => remove(fav)}
                  aria-label={`Retirer ${a.name} des favoris`}
                  title="Retirer des favoris"
                  className="absolute top-3 left-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-primary shadow-sm transition-colors hover:bg-white"
                >
                  <span className="material-symbols-outlined text-xl" aria-hidden="true">
                    favorite
                  </span>
                </button>
                {a.role && (
                  <span className="absolute top-3 right-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                    {a.role}
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="truncate text-sm font-bold text-on-surface">{a.role}</p>
                <div className="mt-3 flex items-center gap-2.5">
                  <Avatar className="h-10 w-10 shrink-0">
                    {a.avatarUrl && <AvatarImage src={assetUrl(a.avatarUrl)} alt="" />}
                    <AvatarFallback>{initials(a.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-on-surface">{a.name}</p>
                    {(a.location || a.commune) && (
                      <p className="flex items-center gap-1 truncate text-xs text-slate-500">
                        <span className="material-symbols-outlined text-sm" aria-hidden="true">
                          location_on
                        </span>
                        {a.location || a.commune}
                      </p>
                    )}
                  </div>
                  <Link
                    to={`/artisan/${a.slug}`}
                    className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-primary-soft hover:text-primary-deep"
                  >
                    Voir le profil
                  </Link>
                </div>
                {a.reviewsCount > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-on-surface-variant">
                    <Stars rating={a.rating} />
                    <span>
                      {String(a.rating).replace('.', ',')} sur 5 · {a.reviewsCount} avis
                    </span>
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <div className="mt-6 flex flex-col gap-2 rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p>
          Affichage de {sorted.length} favori{sorted.length > 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}