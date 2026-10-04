// Panneau « Disponibilité » — l'état est enregistré via PATCH /api/artisans/me
// et s'affiche sur le profil public et dans les résultats de recherche.
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Switch } from '../../components/ui/switch'

export default function AvailabilityPanel({ available, onToggle, slug }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">Disponible pour de nouvelles interventions</CardTitle>
            <CardDescription className="mt-0.5">
              Cet état s&apos;affiche sur votre profil public et dans les résultats de recherche.
            </CardDescription>
          </div>
          <div className="shrink-0">
            <Switch
              checked={available}
              onCheckedChange={onToggle}
              aria-label="Disponible pour de nouvelles interventions"
            />
          </div>
        </CardHeader>
        <CardContent>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                available ? 'bg-primary-soft text-primary-deep' : 'bg-slate-200 text-slate-600'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${available ? 'bg-primary' : 'bg-slate-500'}`}
                aria-hidden="true"
              />
              {available ? 'Disponible' : 'Indisponible'}
            </span>
            <span className="text-on-surface-variant font-normal">
              {available
                ? 'Vous acceptez les nouvelles demandes.'
                : 'Vous n\u2019apparaissez plus comme disponible.'}
            </span>
          </p>
        </CardContent>
      </Card>

      <Card className="mb-0">
        <CardContent className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
          <p className="text-sm text-on-surface-variant">
            <span className="font-semibold text-on-surface">Aperçu :</span> votre état se
            répercute exactement là où les clients vous trouvent.
          </p>
          <Link
            to={slug ? `/artisan/${slug}` : '/recherche'}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-on-surface transition-colors hover:border-primary hover:text-primary"
          >
            Consulter mon profil public
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}