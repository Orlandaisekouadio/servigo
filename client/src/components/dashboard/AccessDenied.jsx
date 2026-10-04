// Refus d'accès à un espace réservé à un autre rôle. Miroir exact de ce que
// renvoie l'API (`403 « Accès interdit. »`) : on ne dessine jamais un tableau de
// bord avec des valeurs de repli, ce qui laisserait croire à un compte artisan
// alors que la requête échouera.
import { Link } from 'react-router-dom'

const SPACES = {
  artisan: {
    icon: 'construction',
    title: 'Accès interdit.',
    body: 'Cet espace est réservé aux comptes artisans. Votre compte est un compte client : tous vos favoris, vos avis et votre profil se gèrent depuis votre espace client.',
    cta: { to: '/espace-client', label: 'Aller à mon espace client' },
  },
  client: {
    icon: 'handyman',
    title: 'Accès interdit.',
    body: 'Cet espace est réservé aux comptes clients. Le vôtre est un compte artisan : votre profil public, votre galerie et vos statistiques se gèrent depuis votre espace artisan.',
    cta: { to: '/espace-artisan', label: 'Aller à mon espace artisan' },
  },
  admin: {
    icon: 'admin_panel_settings',
    title: 'Accès réservé aux administrateurs.',
    body: "Le back-office n'est accessible qu'aux comptes administrateurs. Votre compte n'en fait pas partie : le catalogue des métiers et des communes, les fiches et les avis se gèrent par une personne de l'équipe.",
    cta: { to: '/', label: "Retour à l'accueil" },
  },
}

export default function AccessDenied({ space = 'artisan' }) {
  const copy = SPACES[space] ?? SPACES.artisan
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-container-lowest px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-8 text-center shadow-raised">
        <span className="material-symbols-outlined mb-4 block text-5xl text-slate-400" aria-hidden="true">
          {copy.icon}
        </span>
        <h1 className="text-xl font-semibold text-on-surface">{copy.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{copy.body}</p>
        <Link
          to={copy.cta.to}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-deep"
        >
          {copy.cta.label}
        </Link>
        <div className="mt-4">
          <Link to="/" className="text-sm text-slate-500 underline-offset-4 hover:text-primary hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  )
}