// Espace client (démo) — dashboard autonome : profil, artisans favoris, historique
// des contacts, avis laissés. Identité du compte : Aïcha Coulibaly, déjà présente
// dans les avis publics de la vitrine. Accessible depuis le menu de compte de la nav
// (une fois connecté), et par URL directe.
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import DashboardShell from '../../components/dashboard/DashboardShell'
import DemoBanner from '../../components/dashboard/DemoBanner'
import { Badge } from '../../components/ui/badge'
import { reviews } from '../../data/reviews'
import { clientAccount as ACCOUNT } from '../../data/clientAccount'
import ProfilePanel from './ProfilePanel'
import FavoritesPanel from './FavoritesPanel'
import HistoryPanel from './HistoryPanel'
import ReviewsPanel from './ReviewsPanel'

const SECTIONS = [
  { id: 'profil', label: 'Profil', icon: 'account_circle' },
  { id: 'favoris', label: 'Artisans favoris', icon: 'favorite' },
  { id: 'historique', label: 'Historique des contacts', icon: 'history' },
  { id: 'avis', label: 'Avis laissés', icon: 'rate_review' },
]

const REVIEWS_COUNT = reviews.filter((r) => r.name === ACCOUNT.name).length

export default function ClientDashboardPage() {
  // Le menu de compte de la nav pointe vers /espace-client?section=<id> pour
  // ouvrir directement la bonne section ; sinon on démarre sur « Profil ».
  const [searchParams] = useSearchParams()
  const requested = searchParams.get('section')
  const initialTab = SECTIONS.some((s) => s.id === requested) ? requested : 'profil'
  const [tab, setTab] = useState(initialTab)
  const activeLabel = SECTIONS.find((s) => s.id === tab)?.label ?? 'Profil'

  return (
    <DashboardShell
      spaceLabel="Espace client"
      items={SECTIONS}
      value={tab}
      onValueChange={setTab}
      account={{
        name: ACCOUNT.name,
        avatar: ACCOUNT.avatar,
        meta: `Membre depuis ${ACCOUNT.memberSince}`,
        initials: 'AC',
      }}
      header={
        <>
          <DemoBanner>
            <strong className="font-bold">Espace de démonstration.</strong>{' '}
            Les actions fonctionnent en mémoire pendant la session (réinitialisées au
            rechargement) et le contenu de démonstration est étiqueté « (démo) ». L&apos;identité
            du compte reprend une cliente déjà présente dans les avis de la vitrine.
          </DemoBanner>
          <div className="mb-6 rounded-2xl bg-surface-container-low px-5 py-6 text-center md:py-8">
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-on-surface md:text-3xl">
              {activeLabel}
            </h2>
            <nav aria-label="Fil d'Ariane" className="mt-2">
              <ol className="flex items-center justify-center gap-1.5 text-sm text-slate-500">
                <li>
                  <Link
                    to="/"
                    className="flex items-center gap-1 transition-colors hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-base" aria-hidden="true">
                      home
                    </span>
                    <span className="sr-only">Accueil</span>
                  </Link>
                </li>
                <li aria-hidden="true">
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </li>
                <li>Client</li>
                <li aria-hidden="true">
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </li>
                <li aria-current="page" className="font-semibold text-on-surface">
                  {activeLabel}
                </li>
              </ol>
            </nav>
            <p className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
              <Badge variant="soft">
                <span className="material-symbols-outlined text-sm" aria-hidden="true">
                  verified_user
                </span>
                Compte client
              </Badge>
              <span className="text-sm text-on-surface-variant">
                {REVIEWS_COUNT} avis publié{REVIEWS_COUNT > 1 ? 's' : ''} · {ACCOUNT.location}
              </span>
            </p>
          </div>
        </>
      }
    >
      <ProfilePanel account={ACCOUNT} />
      <FavoritesPanel />
      <HistoryPanel />
      <ReviewsPanel />
    </DashboardShell>
  )
}