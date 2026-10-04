// Espace client — dashboard autonome : profil, artisans favoris, historique
// des contacts, avis laissés. L'identité vient du compte connecté à l'API,
// accessible depuis le menu de compte de la nav, et par URL directe.
import { useEffect, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import DashboardShell from '../../components/dashboard/DashboardShell'
import AccessDenied from '../../components/dashboard/AccessDenied'
import { Badge } from '../../components/ui/badge'
import { useAuth } from '../../auth/useAuth'
import { initialsOf, memberSinceLabel } from '../../lib/identity'
import { listMyReviews } from '../../services/socialService'
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

export default function ClientDashboardPage() {
  const { user, loading } = useAuth()
  // Le menu de compte de la nav pointe vers /espace-client?section=<id> pour
  // ouvrir directement la bonne section ; sinon on démarre sur « Profil ».
  const [searchParams] = useSearchParams()
  const requested = searchParams.get('section')
  const initialTab = SECTIONS.some((s) => s.id === requested) ? requested : 'profil'
  const [tab, setTab] = useState(initialTab)
  const activeLabel = SECTIONS.find((s) => s.id === tab)?.label ?? 'Profil'
  // Le compteur du bandeau et la liste du panneau « Avis laissés » portent sur la
  // même ressource : on la lit une fois ici et on la redistribue au panneau.
  const [reviews, setReviews] = useState(null)

  // Même règle que le `restrictTo('client')` de l'API pour les actions clients.
  const allowed = user?.role === 'client' || user?.role === 'admin'

  useEffect(() => {
    if (!user || !allowed) return
    let cancelled = false
    listMyReviews()
      .then((res) => {
        if (!cancelled) setReviews(res?.data ?? [])
      })
      .catch(() => {
        if (!cancelled) setReviews([])
      })
    return () => {
      cancelled = true
    }
  }, [user, allowed])

  // Espace personnel : fermé aux visiteurs non connectés.
  if (loading) return null
  if (!user) return <Navigate to="/connexion" replace />
  if (!allowed) return <AccessDenied space="client" />

  // Tant que la lecture est en cours, on n'annonce aucun chiffre.
  const reviewsCount = reviews?.length
  const memberSince = memberSinceLabel(user.createdAt)

  return (
    <DashboardShell
      spaceLabel="Espace client"
      items={SECTIONS}
      value={tab}
      onValueChange={setTab}
      account={{
        name: user.name,
        avatar: user.avatarUrl || undefined,
        meta: memberSince ? `Membre depuis ${memberSince}` : 'Compte ServiGo',
        initials: initialsOf(user.name),
      }}
      header={
        <div className="mb-6 rounded-2xl bg-surface-container-low px-5 py-6 text-center md:py-8">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-on-surface md:text-3xl">
            {activeLabel}
          </h2>
          <nav aria-label="Fil d'Ariane" className="mt-2">
            <ol className="flex items-center justify-center gap-1.5 text-sm text-slate-500">
              <li>
                <Link to="/" className="flex items-center gap-1 transition-colors hover:text-primary">
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
              {reviewsCount == null
                ? 'Lecture de vos avis…'
                : `${reviewsCount} avis publié${reviewsCount > 1 ? 's' : ''}`}
              {user.commune ? ` · ${user.commune}` : ''}
            </span>
          </p>
        </div>
      }
    >
      <ProfilePanel />
      <FavoritesPanel />
      <HistoryPanel />
      <ReviewsPanel reviews={reviews} onChange={setReviews} />
    </DashboardShell>
  )
}