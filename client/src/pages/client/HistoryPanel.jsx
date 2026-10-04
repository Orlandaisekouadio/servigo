// Panneau « Historique des contacts » (client).
//
// ServiGo est une vitrine : elle met en relation client et artisan sans
// enregistrer les échanges. Aucun historique de prises de contact n'est donc
// conservé en base — ni côté serveur, ni ici. Le panneau explique ce point
// plutôt que d'afficher un faux relevé d'interventions.
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'

export default function HistoryPanel() {
  return (
    <Card className="mb-0">
      <CardHeader>
        <CardTitle className="text-lg">Historique des contacts</CardTitle>
        <CardDescription className="mt-0.5">
          Vos échanges avec les artisans, en un coup d&apos;œil.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-2xl border border-slate-200 bg-surface-container-low p-6 text-center">
          <span
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft"
            aria-hidden="true"
          >
            <span className="material-symbols-outlined text-3xl text-primary">history</span>
          </span>
          <p className="mt-4 font-bold text-on-surface">
            Aucun historique n&apos;est conservé par ServiGo
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-on-surface-variant">
            La plateforme sert de vitrine : elle vous met en relation avec l&apos;artisan, puis
            vous négociez et réglez directement avec lui. Vos conversations restent
            entre vous, dans WhatsApp ou au téléphone, et ne sont ni enregistrées ni
            revendues.
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-on-surface-variant">
            Pour retrouver un artisan, retrouvez-le dans vos favoris ou relancez une recherche.
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
      </CardContent>
    </Card>
  )
}