// Panneau « Avis » — moyenne et avis réellement rattachés au profil de l'artisan
// connecté. Les compteurs viennent de la page (GET /api/artisans/me/stats), la
// liste des derniers avis de la fiche publique.
import { useEffect, useState } from 'react'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent } from '../../components/ui/card'
import Stars from '../../components/dashboard/Stars'
import { getPublicProfile } from '../../services/artisanService'

export default function ReviewsPanel({ profile, stats }) {
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    if (!profile?.slug) return
    let cancelled = false
    getPublicProfile(profile.slug)
      .then((res) => {
        if (!cancelled) setReviews(res?.data?.reviews ?? [])
      })
      .catch(() => {
        // Fiche publique inaccessible : la liste d'avis reste vide.
      })
    return () => {
      cancelled = true
    }
  }, [profile?.slug])

  const rating = stats?.rating ?? profile?.rating ?? 0
  const reviewsCount = stats?.reviewsCount ?? profile?.reviewsCount ?? 0

  return (
    <div className="space-y-6">
      <Card className="mb-0">
        <CardContent className="flex flex-col gap-6 pt-5 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
          <div className="flex items-center gap-4">
            <p className="text-5xl font-bold tracking-tight text-primary-deep">
              {rating.toLocaleString('fr-FR')}
            </p>
            <div>
              <Stars rating={rating} />
              <p className="mt-1 text-sm text-on-surface-variant">
                Basé sur {reviewsCount} avis publics
              </p>
            </div>
          </div>
          <Badge variant="soft">
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              verified
            </span>
            Avis repris du profil public
          </Badge>
        </CardContent>
      </Card>

      {reviews.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
          Aucun avis publié pour le moment. Ils apparaîtront ici dès que vos clients en
          rédigeront.
        </p>
      ) : (
        <div className="space-y-5">
          {reviews.map((r) => (
            <article
              key={r._id ?? r.author}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft font-bold text-primary-deep">
                    {(r.authorName || r.author || '?').slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-bold text-on-surface">{r.authorName || r.author}</p>
                    {r.authorCommune && <p className="text-xs text-slate-500">{r.authorCommune}</p>}
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
        </div>
      )}
    </div>
  )
}