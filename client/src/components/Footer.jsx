import { Link } from 'react-router-dom'
import Logo from './Logo'
import { useServices } from '../hooks/useReferentials'

// Pied de page commun à toutes les pages.
//
// Deux règles ont présidé à son réécriture :
//
// 1. Aucun lien vers une page qui n'existe pas. Les colonnes listaient « Blog »,
//    « Carrières », « Témoignages », « Légal » et quatre pages juridiques sans
//    destination, plus un lien vers une galerie de préchargeurs qui était un
//    écran de développement. Ces entrées promettaient des pages que le site n'a
//    pas : elles ont été retirées plutôt que transformées en texte inerte.
//
// 2. Aucun comportement simulé. Le formulaire de newsletter annonçait une
//    inscription alors qu'aucun appel n'était fait et qu'aucune liste n'était
//    conservée — le service n'existe pas. Il a été retiré : un pied de page qui
//    confirme une inscription sans rien enregistrer est un mensonge, pas une
//    fonctionnalité. Le bloc laissé vide par ce retrait est repris par la
//    colonne « Métiers », qui elle est réelle.
const AIDE_LINKS = [
  { label: 'Notre mission', to: '/contact#mission' },
  { label: 'Comment ça marche', to: '/#comment' },
  { label: 'Devenir artisan', to: '/devenir-artisan' },
  { label: 'Les avis clients', to: '/#avis' },
]

const COMPTE_LINKS = [
  { label: 'Contact', to: '/contact' },
  { label: 'Questions fréquentes', to: '/contact#faq' },
  { label: 'Se connecter', to: '/connexion' },
  { label: 'Créer un compte', to: '/inscription' },
]

// Au-delà de six métiers, la colonne devient un index plutôt qu'un raccourci ;
// la recherche reste le point d'entrée pour le reste.
const METIERS_MAX = 6

function Colonne({ titre, children }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold tracking-wider text-on-surface uppercase">{titre}</h3>
      {children}
    </div>
  )
}

function Liste({ liens }) {
  return (
    <ul className="space-y-1">
      {liens.map((lien) => (
        <li key={lien.to}>
          <Link
            to={lien.to}
            className="inline-flex min-h-11 items-center text-sm text-slate-500 transition-colors hover:text-primary"
          >
            {lien.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default function Footer() {
  // Métiers issus du catalogue administrable : un métier ajouté par l'admin
  // devient un raccourci dans le pied de page sans intervention. Le libellé
  // servi est le nom du service, ce qui garantit que le lien aboutit à une
  // recherche qui rend des résultats.
  const { valeur: metiers } = useServices()
  const raccourcis = metiers
    .filter((s) => s.name)
    .slice(0, METIERS_MAX)
    .map((s) => ({ label: s.name, to: `/recherche?metier=${encodeURIComponent(s.name)}` }))

  return (
    <footer className="border-t border-outline-variant/30 bg-surface-container-low">
      <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo size="lg" className="mb-4 block" />
            <p className="max-w-xs text-sm leading-relaxed text-slate-600">
              La plateforme de confiance pour trouver les meilleurs artisans qualifiés en Côte
              d&apos;Ivoire.
            </p>
            <p className="mt-6 text-sm font-medium text-slate-500">Abidjan, Côte d&apos;Ivoire</p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8">
            <Colonne titre="Métiers">
              {raccourcis.length ? (
                <Liste liens={raccourcis} />
              ) : (
                // Le catalogue n'est pas encore lu : on affiche l'entrée qui, elle,
                // fonctionne sans lui.
                <ul className="space-y-1">
                  <li>
                    <Link
                      to="/recherche"
                      className="inline-flex min-h-11 items-center text-sm text-slate-500 transition-colors hover:text-primary"
                    >
                      Tous les métiers
                    </Link>
                  </li>
                </ul>
              )}
            </Colonne>

            <Colonne titre="ServiGo">
              <Liste liens={AIDE_LINKS} />
            </Colonne>

            <Colonne titre="Compte">
              <Liste liens={COMPTE_LINKS} />
            </Colonne>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-8 text-center text-sm text-slate-500 md:text-left">
          <p>© 2026 ServiGo. Tous droits réservés.</p>
          <p className="mt-1 font-medium text-primary">Construit pour l&apos;artisanat ivoirien.</p>
        </div>
      </div>
    </footer>
  )
}
