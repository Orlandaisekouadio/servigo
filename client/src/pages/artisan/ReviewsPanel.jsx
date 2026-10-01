// Panneau « Avis » — moyenne réelle du site + liste des avis du profil public.
import { koffiProfile } from '../../data/search'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent } from '../../components/ui/card'
import Stars from '../../components/dashboard/Stars'

export default function ReviewsPanel({ account }) {
  return (
    <div className="space-y-6">
      <Card className="mb-0">
        <CardContent className="flex flex-col gap-6 pt-5 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
          <div className="flex items-center gap-4">
            <p className="text-5xl font-bold tracking-tight text-primary-deep">
              {account.rating.toLocaleString('fr-FR')}
            </p>
            <div>
              <Stars rating={account.rating} />
              <p className="mt-1 text-sm text-on-surface-variant">
                Basé sur {account.reviewsCount} avis publics
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

      <div className="space-y-5">
        {koffiProfile.reviews.map((r) => (
          <article
            key={r.author}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft font-bold text-primary-deep">
                  {r.author[0]}
                  {r.author[1]}
                </span>
                <div>
                  <p className="font-bold text-on-surface">{r.author}</p>
                  <p className="text-xs text-slate-500">{r.location}</p>
                </div>
              </div>
              <Stars rating={r.rating} />
            </div>
            <p className="text-sm leading-6 text-slate-600">{r.text}</p>
            <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary">
              <span className="material-symbols-outlined text-sm" aria-hidden="true">
                handyman
              </span>
              Prestation : {r.service}
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}