// Panneau « Historique des contacts » (client) — lignes de démonstration
// construites à partir d'artisans réels du site, clairement étiquetées.
import { searchArtisans } from '../../data/search'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Separator } from '../../components/ui/separator'

const HISTORY = [
  {
    slug: 'mamadou-kone',
    service: 'Demande de devis',
    detail: 'Fuite dans la salle de bain',
    date: '12 sept. 2026',
    status: { label: 'Terminé', variant: 'soft' },
  },
  {
    slug: 'maitre-yao',
    service: 'Devis sur mesure',
    detail: 'Armoire coulissante pour chambre',
    date: '2 sept. 2026',
    status: { label: 'En attente', variant: 'amber' },
  },
  {
    slug: 'koffi-amani',
    service: 'Intervention électrique',
    detail: 'Remplacement du tableau',
    date: '24 août 2026',
    status: { label: 'Terminé', variant: 'soft' },
  },
]

const initials = (name) => name.split(' ').slice(0, 2).map((w) => w[0]).join('')

export default function HistoryPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Historique des contacts</CardTitle>
        <CardDescription className="mt-0.5">
          Historique de démonstration : aucune mise en relation réelle n&apos;a eu lieu — les
          lignes illustrent la structure, avec des artisans présents sur la vitrine.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-0">
          {HISTORY.map((h, i) => {
            const artisan = searchArtisans.find((a) => a.slug === h.slug)
            if (!artisan) return null
            return (
              <li key={h.slug}>
                {i > 0 && <Separator className="my-4" />}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage src={artisan.avatar} alt={`Portrait de ${artisan.name}`} />
                    <AvatarFallback>{initials(artisan.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-on-surface">{artisan.name}</p>
                      <Badge variant={h.status.variant}>{h.status.label}</Badge>
                    </div>
                    <p className="text-sm text-slate-500">
                      {h.service} · {h.detail}
                    </p>
                    <p className="text-xs text-slate-400">
                      {artisan.metier} · {h.date}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-medium text-slate-600">
                    {h.status.label === 'Terminé' ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base text-primary" aria-hidden="true">
                          check_circle
                        </span>
                        Intervention suivie
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base text-amber-600" aria-hidden="true">
                          schedule
                        </span>
                        Réponse attendue
                      </span>
                    )}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
        <p className="mt-5 flex items-center gap-1.5 text-xs text-slate-500">
          <span className="material-symbols-outlined text-sm" aria-hidden="true">
            info
          </span>
          Dates et statuts fictifs — données d&apos;exemple (démo).
        </p>
      </CardContent>
    </Card>
  )
}