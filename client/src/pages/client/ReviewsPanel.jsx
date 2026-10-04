// Panneau « Avis laissés » (client) — avis réellement publiés par le compte
// connecté, via GET /api/reviews/me et DELETE /api/reviews/:id. La liste arrive
// de la page (qui la lit une seule fois pour le bandeau et ce panneau) ; la
// suppression est optimiste et remonte la liste restante à la page.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Separator } from '../../components/ui/separator'
import Stars from '../../components/dashboard/Stars'
import { getErrorMessage } from '../../lib/api'
import { deleteMyReview } from '../../services/socialService'

const dateFr = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

export default function ReviewsPanel({ reviews, onChange }) {
  const [error, setError] = useState('')
  // `null` tant que la page n'a pas répondu : on affiche un statut, pas « 0 avis ».
  const loading = reviews == null
  const list = reviews ?? []

  const remove = async (id) => {
    setError('')
    const previous = reviews
    onChange?.(list.filter((r) => r._id !== id))
    try {
      const res = await deleteMyReview(id)
      if (!res?.ok) throw new Error(res?.message || 'Suppression impossible.')
    } catch (err) {
      onChange?.(previous)
      setError(getErrorMessage(err))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Avis laissés{' '}
          <span className="text-on-surface-variant font-semibold">({list.length})</span>
        </CardTitle>
        <CardDescription className="mt-0.5">
          Avis que vous avez publiés sur les fiches d&apos;artisans.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <p role="alert" className="mb-4 flex items-center gap-1.5 text-sm font-medium text-error">
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              error
            </span>
            {error}
          </p>
        )}

        {loading ? (
          <p role="status" className="py-8 text-center text-sm text-slate-500">
            Chargement de vos avis…
          </p>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center md:py-10">
            <span
              className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft"
              aria-hidden="true"
            >
              <span className="material-symbols-outlined text-3xl text-primary">rate_review</span>
            </span>
            <div>
              <p className="text-lg font-bold text-on-surface">
                Aucun avis laissé pour l&apos;instant
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                Après une intervention, vous pourrez noter votre artisan et laisser un retour.
              </p>
            </div>
            <Link
              to="/recherche"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-7 text-sm font-semibold text-on-surface transition-colors hover:border-primary hover:text-primary"
            >
              Retourner à la recherche
            </Link>
          </div>
        ) : (
          <ul className="space-y-0">
            {list.map((r, i) => (
              <li key={r._id}>
                {i > 0 && <Separator className="my-4" />}
                <article>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3">
                      <Stars rating={r.rating} />
                      <span className="text-sm font-medium text-on-surface-variant">
                        {r.location || 'Intervention ServiGo'}
                        {dateFr(r.createdAt) ? ` · ${dateFr(r.createdAt)}` : ''}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(r._id)}
                      className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
                    >
                      <span className="material-symbols-outlined text-base" aria-hidden="true">
                        delete
                      </span>
                      Supprimer
                    </button>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">« {r.text} »</p>
                  {r.service && (
                    <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-primary">
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">
                        handyman
                      </span>
                      Prestation : {r.service}
                    </p>
                  )}
                  {r.artisan && (
                    <p className="mt-2">
                      <Link
                        to={`/artisan/${r.artisan.slug}`}
                        className="text-xs font-semibold text-primary underline underline-offset-2"
                      >
                        {r.artisan.name}
                      </Link>
                    </p>
                  )}
                </article>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}