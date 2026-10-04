// Panneau « Statistiques » — uniquement du mesurable : compteurs renvoyés par
// GET /api/artisans/me/stats (avis, favoris, galerie, zones d'intervention).
// ServiGo n'enregistre ni vues de profil, ni demandes de devis, ni taux de
// réponse : ces indicateurs ne sont donc pas affichés.
import { Card, CardContent } from '../../components/ui/card'
import { Progress } from '../../components/ui/progress'
import { Separator } from '../../components/ui/separator'

const memberSince = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

export default function StatsPanel({ stats }) {
  const CARDS = [
    { icon: 'star', label: 'Note moyenne', value: (stats?.rating ?? 0).toLocaleString('fr-FR') },
    { icon: 'rate_review', label: 'Avis publiés', value: stats?.reviewsCount ?? 0 },
    { icon: 'favorite', label: 'Artisans en favori', value: stats?.favoritesCount ?? 0 },
    { icon: 'photo_library', label: 'Photos en galerie', value: stats?.galleryCount ?? 0 },
    { icon: 'map', label: "Zones d'intervention", value: stats?.zonesCount ?? 0 },
  ]

  const byService = stats?.reviewsByService ?? []
  const maxService = Math.max(1, ...byService.map((s) => s.count))
  const distribution = stats?.ratingDistribution ?? []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CARDS.map((s) => (
          <Card key={s.label} className="mb-0">
            <CardContent className="pt-5 md:pt-6">
              <div className="flex items-center gap-2 text-sm font-medium text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px] text-primary" aria-hidden="true">
                  {s.icon}
                </span>
                {s.label}
              </div>
              <p className="mt-2 font-display text-3xl font-bold text-on-surface">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-0">
        <CardContent className="pt-5 md:pt-6">
          <h3 className="text-sm font-bold text-on-surface">Avis par prestation</h3>
          {byService.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              Aucun avis publié pour le moment.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {byService.map((s) => (
                <li key={s.label}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-on-surface">{s.label}</span>
                    <span className="text-on-surface-variant">{s.count}</span>
                  </div>
                  <Progress value={(s.count / maxService) * 100} />
                </li>
              ))}
            </ul>
          )}

          <Separator className="my-6" />

          <h3 className="text-sm font-bold text-on-surface">Répartition des notes</h3>
          {distribution.every((d) => d.count === 0) ? (
            <p className="mt-3 text-sm text-slate-500">Aucun avis publié pour le moment.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {[...distribution].reverse().map((d) => {
                const total = distribution.reduce((sum, x) => sum + x.count, 0)
                return (
                  <li key={d.stars} className="flex items-center gap-3">
                    <span className="w-6 shrink-0 text-right text-sm font-semibold text-on-surface-variant">
                      {d.stars}★
                    </span>
                    <Progress value={total ? (d.count / total) * 100 : 0} className="flex-1" />
                    <span className="w-8 shrink-0 text-right text-sm text-on-surface-variant">
                      {d.count}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}

          <Separator className="my-6" />

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-on-surface-variant">Profil créé le</dt>
              <dd className="font-semibold text-on-surface">{memberSince(stats?.memberSince)}</dd>
            </div>
            <div>
              <dt className="text-on-surface-variant">Dernier avis reçu</dt>
              <dd className="font-semibold text-on-surface">
                {stats?.lastReviewAt
                  ? new Date(stats.lastReviewAt).toLocaleDateString('fr-FR')
                  : 'Aucun'}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}