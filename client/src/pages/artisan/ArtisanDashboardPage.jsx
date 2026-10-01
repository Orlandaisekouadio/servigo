// Espace artisan (démo) — dashboard autonome : disponibilité, profil, galerie, avis,
// statistiques. Identité du compte : Koffi Amani (données du profil public du site).
// Aucune navbar ni footer de la vitrine : l'accès se fait par URL directe /espace-artisan.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardShell from '../../components/dashboard/DashboardShell'
import DemoBanner from '../../components/dashboard/DemoBanner'
import AccountStrip from '../../components/dashboard/AccountStrip'
import { Badge } from '../../components/ui/badge'
import { koffiProfile, searchArtisans } from '../../data/search'
import AvailabilityPanel from './AvailabilityPanel'
import ProfilePanel from './ProfilePanel'
import GalleryPanel from './GalleryPanel'
import ReviewsPanel from './ReviewsPanel'
import StatsPanel from './StatsPanel'

const ACCOUNT = (() => {
  const listing = searchArtisans.find((a) => a.slug === koffiProfile.slug)
  return {
    slug: koffiProfile.slug,
    name: koffiProfile.name,
    role: koffiProfile.role,
    avatar: koffiProfile.avatar,
    cover: koffiProfile.cover,
    location: koffiProfile.location,
    rating: listing?.rating ?? 4.9,
    reviewsCount: listing?.reviews ?? 0,
  }
})()

const SECTIONS = [
  { id: 'disponibilite', label: 'Disponibilité', icon: 'toggle_on' },
  { id: 'profil', label: 'Profil', icon: 'manage_accounts' },
  { id: 'galerie', label: 'Galerie', icon: 'photo_library' },
  { id: 'avis', label: 'Avis', icon: 'reviews' },
  { id: 'statistiques', label: 'Statistiques', icon: 'monitoring' },
]

export default function ArtisanDashboardPage() {
  const [tab, setTab] = useState('disponibilite')
  const [available, setAvailable] = useState(true)

  return (
    <DashboardShell
      spaceLabel="Espace artisan"
      items={SECTIONS}
      value={tab}
      onValueChange={setTab}
      account={{
        name: ACCOUNT.name,
        avatar: ACCOUNT.avatar,
        meta: `${ACCOUNT.role} · ${ACCOUNT.location}`,
        initials: 'KA',
      }}
      header={
        <>
          <DemoBanner>
            <strong className="font-bold">Espace de démonstration.</strong>{' '}
            Les actions fonctionnent en mémoire pendant la session (réinitialisées au
            rechargement) et les chiffres artificiels sont étiquetés « (démo) ». Les informations
            reproduisent le profil public de {ACCOUNT.name}.
          </DemoBanner>
          <AccountStrip
            name={ACCOUNT.name}
            avatar={ACCOUNT.avatar}
            initials="KA"
            subtitle={`${ACCOUNT.role} · ${ACCOUNT.location}`}
            badges={
              <>
                <Badge variant="soft">
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">
                    verified
                  </span>
                  Vérifié
                </Badge>
                <span className="flex items-center gap-1 text-sm font-medium text-on-surface-variant">
                  <span className="material-symbols-outlined text-lg text-accent" aria-hidden="true">
                    star
                  </span>
                  {ACCOUNT.rating.toLocaleString('fr-FR')} sur 5
                  <span className="text-slate-300">·</span>
                  {ACCOUNT.reviewsCount} avis
                </span>
              </>
            }
            right={
              <Link
                to={`/artisan/${ACCOUNT.slug}`}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-on-surface transition-colors hover:border-primary hover:text-primary"
              >
                Voir mon profil public
                <span className="material-symbols-outlined text-base" aria-hidden="true">
                  open_in_new
                </span>
              </Link>
            }
          />
        </>
      }
    >
      <AvailabilityPanel available={available} onToggle={setAvailable} />
      <ProfilePanel account={ACCOUNT} />
      <GalleryPanel />
      <ReviewsPanel account={ACCOUNT} />
      <StatsPanel account={ACCOUNT} />
    </DashboardShell>
  )
}