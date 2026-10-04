// Espace artisan — dashboard autonome : disponibilité, profil, galerie, avis,
// statistiques. L'identité vient du profil artisan rattaché au compte connecté.
// Aucune navbar ni footer de la vitrine : l'accès se fait par /espace-artisan.
import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import DashboardShell from '../../components/dashboard/DashboardShell'
import AccountStrip from '../../components/dashboard/AccountStrip'
import AccessDenied from '../../components/dashboard/AccessDenied'
import { Badge } from '../../components/ui/badge'
import { useAuth } from '../../auth/useAuth'
import { initialsOf } from '../../lib/identity'
import { getErrorMessage } from '../../lib/api'
import {
  getMyArtisanProfile,
  getMyStats,
  updateProfileAvailability,
} from '../../services/artisanService'
import AvailabilityPanel from './AvailabilityPanel'
import ProfilePanel from './ProfilePanel'
import GalleryPanel from './GalleryPanel'
import ReviewsPanel from './ReviewsPanel'
import StatsPanel from './StatsPanel'

const SECTIONS = [
  { id: 'disponibilite', label: 'Disponibilité', icon: 'toggle_on' },
  { id: 'profil', label: 'Profil', icon: 'manage_accounts' },
  { id: 'galerie', label: 'Galerie', icon: 'photo_library' },
  { id: 'avis', label: 'Avis', icon: 'reviews' },
  { id: 'statistiques', label: 'Statistiques', icon: 'monitoring' },
]

export default function ArtisanDashboardPage() {
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [tab, setTab] = useState('disponibilite')
  const [available, setAvailable] = useState(true)

  // Le toggle optimiste puis revert en cas d'échec : l'état affiché reste vrai.
  const toggleAvailability = async (next) => {
    const previous = available
    setAvailable(next)
    try {
      const res = await updateProfileAvailability(next, next ? 'Disponible' : 'Indisponible')
      if (res?.ok) setProfile((p) => (p ? { ...p, available: next } : p))
    } catch (err) {
      setAvailable(previous)
      setLoadError(getErrorMessage(err))
    }
  }

  // Mêmes rôles que le `restrictTo('artisan', 'admin')` de l'API : un compte client
  // est refusé ici aussi, plutôt que de lui afficher un tableau de bord d'artisan
  //dont chaque chiffre serait un repli.
  const allowed = user?.role === 'artisan' || user?.role === 'admin'

  // Le profil artisan est créé par l'API au premier appel : un compte artisan
  // fraîchement inscrit n'en a pas encore. Les compteurs sont lus une seule fois
  // ici et redistribués aux panneaux, plutôt que refetchés par chacun d'eux.
  useEffect(() => {
    if (!user || !allowed) return
    let cancelled = false
    Promise.all([getMyArtisanProfile(), getMyStats().catch(() => null)])
      .then(([profileRes, statsRes]) => {
        if (cancelled) return
        setProfile(profileRes?.data ?? null)
        setStats(statsRes?.data ?? null)
        if (typeof profileRes?.data?.available === 'boolean') setAvailable(profileRes.data.available)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getErrorMessage(err))
      })
    return () => {
      cancelled = true
    }
  }, [user, allowed])

  // Espace professionnel : fermé aux visiteurs non connectés.
  if (loading) return null
  if (!user) return <Navigate to="/connexion" replace />
  if (!allowed) return <AccessDenied space="artisan" />

  const name = profile?.name || user.name
  const role = profile?.role || user.specialite || 'Artisan'
  const location = profile?.location || profile?.commune || user.commune || 'Zone non renseignée'
  const rating = profile?.rating ?? 0
  const reviewsCount = profile?.reviewsCount ?? 0

  return (
    <DashboardShell
      spaceLabel="Espace artisan"
      items={SECTIONS}
      value={tab}
      onValueChange={setTab}
      account={{
        name,
        avatar: profile?.avatarUrl || undefined,
        meta: `${role} · ${location}`,
        initials: initialsOf(name),
      }}
      header={
        <>
          {loadError && (
            <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800">
              {loadError}
            </p>
          )}

          <AccountStrip
            name={name}
            avatar={profile?.avatarUrl || undefined}
            initials={initialsOf(name)}
            subtitle={`${role} · ${location}`}
            badges={
              <>
                {profile?.verified && (
                  <Badge variant="soft">
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">
                      verified
                    </span>
                    Vérifié
                  </Badge>
                )}
                <span className="flex items-center gap-1 text-sm font-medium text-on-surface-variant">
                  <span className="material-symbols-outlined text-lg text-accent" aria-hidden="true">
                    star
                  </span>
                  {rating.toLocaleString('fr-FR')} sur 5
                  <span className="text-slate-300">·</span>
                  {reviewsCount} avis
                </span>
              </>
            }
            right={
              profile?.slug ? (
                <Link
                  to={`/artisan/${profile.slug}`}
                  className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-on-surface transition-colors hover:border-primary hover:text-primary"
                >
                  Voir mon profil public
                  <span className="material-symbols-outlined text-base" aria-hidden="true">
                    open_in_new
                  </span>
                </Link>
              ) : null
            }
          />
        </>
      }
    >
      <AvailabilityPanel
        available={available}
        onToggle={toggleAvailability}
        slug={profile?.slug}
      />
      <ProfilePanel profile={profile} onSaved={setProfile} />
      <GalleryPanel />
      <ReviewsPanel profile={profile} stats={stats} />
      <StatsPanel stats={stats} />
    </DashboardShell>
  )
}