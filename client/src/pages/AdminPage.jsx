// Back-office — coquille et routage interne.
//
// La section courante vit dans l'URL (`/admin?section=referentiels`), comme
// celle des espaces client et artisan. Un lien vers « Référentiels » peut donc
// être envoyé, mis en favori, survolée : le menu des deux autres espaces
// fonctionne déjà ainsi et le back-office ne doit pas être le seul à ne pas
// remplir ses liens.
//
// L'accès est filtré deux fois, et c'est volontaire : ici pour ne pas afficher
// une coquille à quelqu'un qui n'a rien à y faire, et surtout côté API, qui
// refuse toute route `/admin/*` à un compte non administrateur. Un garde-fou
// purely visuel ne protège rien — la vraie frontière est `restrictTo('admin')`.
import { Navigate, useSearchParams } from 'react-router-dom'
import DashboardShell from '../components/dashboard/DashboardShell'
import AccessDenied from '../components/dashboard/AccessDenied'
import { useAuth } from '../auth/useAuth'
import { initialsOf } from '../lib/identity'
import PanneauOverview from './admin/PanneauOverview'
import PanneauReferentiels from './admin/PanneauReferentiels'
import PanneauArtisans from './admin/PanneauArtisans'
import PanneauAvis from './admin/PanneauAvis'
import PanneauComptes from './admin/PanneauComptes'
import PanneauJournal from './admin/PanneauJournal'

const SECTIONS = [
  { id: 'apercu', label: 'Vue d’ensemble', icon: 'dashboard' },
  { id: 'referentiels', label: 'Référentiels', icon: 'list_alt' },
  { id: 'artisans', label: 'Artisans', icon: 'handyman' },
  { id: 'avis', label: 'Avis', icon: 'rate_review' },
  { id: 'comptes', label: 'Comptes', icon: 'group' },
  { id: 'journal', label: 'Journal', icon: 'history' },
]

const PANNEAUX = {
  apercu: PanneauOverview,
  referentiels: PanneauReferentiels,
  artisans: PanneauArtisans,
  avis: PanneauAvis,
  comptes: PanneauComptes,
  journal: PanneauJournal,
}

export default function AdminPage() {
  const { user, loading } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  if (loading) {
    return (
      <div className="min-h-screen bg-surface" role="status" aria-live="polite">
        <span className="sr-only">Chargement de l’espace d’administration…</span>
      </div>
    )
  }
  if (!user) return <Navigate to="/connexion" replace />
  if (user.role !== 'admin') return <AccessDenied space="administration" />

  // Une section inconnue dans l'URL ne doit pas rendre un écran vide : on repart
  // de la vue d'ensemble. Le paramètre est laissé en place — le réécrire
  // demanderait une synchronisation d'état pendant le rendu, et l'URL conservée
  // n'a rien de cassant tant qu'un lien valide la remplace.
  const demandee = searchParams.get('section')
  const section = SECTIONS.some((s) => s.id === demandee) ? demandee : 'apercu'

  const Panneau = PANNEAUX[section]

  return (
    <DashboardShell
      spaceLabel="Administration"
      items={SECTIONS}
      value={section}
      onValueChange={(id) =>
        setSearchParams(
          (params) => {
            const suivants = new URLSearchParams(params)
            suivants.set('section', id)
            return suivants
          },
          { replace: false }
        )
      }
      account={{
        name: user.name,
        avatar: user.avatarUrl || undefined,
        meta: user.commune ? `Zone : ${user.commune}` : 'Zone non renseignée',
        initials: initialsOf(user.name),
      }}
    >
      <Panneau />
    </DashboardShell>
  )
}
