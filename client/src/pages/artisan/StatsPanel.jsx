// Panneau « Statistiques » — chiffres étiquetés « (démo) », sauf la note moyenne
// (donnée réelle du site).
import { koffiProfile } from '../../data/search'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent } from '../../components/ui/card'
import { Progress } from '../../components/ui/progress'
import { Separator } from '../../components/ui/separator'

const STATS = [
  { icon: 'visibility', label: 'Vues du profil (30 j)', value: '1 247', demo: true },
  { icon: 'request_quote', label: 'Demandes de devis (30 j)', value: '18', demo: true },
  { icon: 'schedule', label: 'Taux de réponse', value: '95 %', demo: true },
  { icon: 'star', label: 'Note moyenne', value: '4,9/5', demo: false },
]

const DEMANDES = [
  { label: 'Tableaux & Remise aux Normes', count: 7 },
  { label: "Dépannage d'urgence", count: 6 },
  { label: 'Onduleurs, Inverseurs & Solaire', count: 3 },
  { label: 'Éclairage Architectural & LED', count: 2 },
]

const NOTE_DISTRIBUTION = [
  { stars: 5, pct: 84 },
  { stars: 4, pct: 12 },
  { stars: 3, pct: 3 },
  { stars: 2, pct: 1 },
  { stars: 1, pct: 0 },
]

const MAX_DEMANDES = Math.max(...DEMANDES.map((d) => d.count))

export default function StatsPanel({ account }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {STATS.map((s) => (
          <Card key={s.label} className="mb-0">
            <CardContent className="pt-5 md:pt-6">
              <div className="flex items-center gap-2 text-sm font-medium text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px] text-primary" aria-hidden="true">
                  {s.icon}
                </span>
                {s.label}
                {s.demo && <Badge variant="amber">démo</Badge>}
              </div>
              <p
                className={`mt-2 text-3xl font-bold tracking-tight ${
                  s.demo ? 'text-on-surface' : 'text-primary-deep'
                }`}
              >
                {s.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-0">
        <CardContent className="pt-5 md:pt-6">
          <h3 className="text-sm font-bold text-on-surface">
            Demandes reçues par prestation{' '}
            <Badge variant="amber" className="ml-1 align-middle">
              démo
            </Badge>
          </h3>
          <ul className="mt-4 space-y-4">
            {DEMANDES.map((d) => (
              <li key={d.label}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-on-surface">{d.label}</span>
                  <span className="text-on-surface-variant">{d.count}</span>
                </div>
                <Progress value={(d.count / MAX_DEMANDES) * 100} />
              </li>
            ))}
          </ul>

          <Separator className="my-6" />

          <h3 className="text-sm font-bold text-on-surface">
            Répartition des notes{' '}
            <Badge variant="amber" className="ml-1 align-middle">
              démo
            </Badge>
          </h3>
          <ul className="mt-4 space-y-3">
            {NOTE_DISTRIBUTION.map((n) => (
              <li key={n.stars} className="flex items-center gap-3">
                <span className="w-6 shrink-0 text-right text-sm font-semibold text-on-surface-variant">
                  {n.stars}★
                </span>
                <Progress value={n.pct} className="flex-1" />
                <span className="w-10 shrink-0 text-xs tabular-nums text-on-surface-variant">
                  {n.pct} %
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-5 text-xs text-slate-500">
            Les prestations sont celles du profil public ({koffiProfile.name}). Chiffres de
            démonstration : aucune donnée réelle n&apos;est collectée par cette vitrine.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}