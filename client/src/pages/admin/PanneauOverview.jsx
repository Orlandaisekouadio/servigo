// Vue d'ensemble — l'état de la plateforme en un écran.
//
// Les compteurs viennent de l'API (`GET /api/admin/stats`) et ne sont calculés
// nulle part ici : un chiffre affiché dans le back-office doit venir de la même
// requête que celle qui gele la liste correspondante, sinon les deux écrans
// finissent par afficher des chiffres différents.
//
// Les liens vont vers l'écran correspondant plutôt que de répéter l'action ici :
// valider un artisan depuis la vue d'ensemble reviendrait à maintenir deux
// écrans pour la même tâche.
import { Link } from 'react-router-dom'
import { getAdminStats } from '../../services/adminService'
import { useRessourceAdmin } from './useRessourceAdmin'
import { Alerte, Chargement, Entete, EtatVide } from './ui'

function Tuile({ libelle, valeur, detail, ton = 'neutre', to }) {
  const corps = (
    <>
      <p className="text-sm font-semibold text-on-surface-variant">{libelle}</p>
      <p
        className={`mt-2 font-display text-4xl font-extrabold tracking-tight ${
          ton === 'alerte' ? 'text-amber-700' : ton === 'succes' ? 'text-primary' : 'text-on-surface'
        }`}
      >
        {valeur}
      </p>
      {detail ? <p className="mt-1 text-xs text-on-surface-variant">{detail}</p> : null}
    </>
  )

  if (!to) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">{corps}</div>
  }
  return (
    <Link
      to={to}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-primary hover:bg-primary-soft/30"
    >
      {corps}
    </Link>
  )
}

export default function PanneauOverview() {
  // `getAdminStats` est une fonction de module : son identité est stable, ce qui
  // évite de rejouer la requête à chaque rendu.
  const { valeur, chargement, erreur } = useRessourceAdmin(getAdminStats)

  if (erreur) {
    return (
      <>
        <Entete titre="Vue d'ensemble" />
        <Alerte ton="erreur">
          <span className="material-symbols-outlined" aria-hidden="true">
            error
          </span>
          {erreur}
        </Alerte>
      </>
    )
  }

  if (chargement || valeur === null) {
    return (
      <>
        <Entete titre="Vue d'ensemble" description="Lecture des compteurs…" />
        <Chargement lignes={4} />
      </>
    )
  }

  const { users, artisans } = valeur
  const enAttente = artisans.pendingValidation
  const masquees = artisans.hidden
  const attestees = artisans.verified
  // Part des fiches attestées sur l'ensemble du parc, hors fiches masquées : la
  // proportion n'a de sens que sur ce qui est visible du public.
  const parcVisible = artisans.total - masquees

  return (
    <>
      <Entete
        titre="Vue d'ensemble"
        description="L'état de la plateforme : comptes, fiches artisans, catalogue et avis. Chaque compteur mène à l'écran qui permet d'agir dessus."
      />

      <section aria-labelledby="titre-comptes" className="mb-8">
        <h3 id="titre-comptes" className="mb-3 font-bold">
          Comptes
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tuile libelle="Comptes au total" valeur={users.total} />
          <Tuile libelle="Clients" valeur={users.client} to="/admin?section=comptes&role=client" />
          <Tuile libelle="Artisans" valeur={users.artisan} to="/admin?section=comptes&role=artisan" />
          <Tuile
            libelle="Administrateurs"
            valeur={users.admin}
            detail="Retirer le rôle d'un administrateur est irréversible pour lui"
            to="/admin?section=comptes&role=admin"
          />
        </div>
      </section>

      <section aria-labelledby="titre-fiches" className="mb-8">
        <h3 id="titre-fiches" className="mb-3 font-bold">
          Fiches artisans
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tuile libelle="Fiches au total" valeur={artisans.total} />
          <Tuile
            libelle="Attestées et visibles"
            valeur={attestees}
            ton={parcVisible > 0 && attestees === parcVisible ? 'succes' : 'neutre'}
            detail={
              parcVisible > 0
                ? `${Math.round((attestees / parcVisible) * 100)} % du parc visible`
                : 'Aucune fiche visible'
            }
            to="/admin?section=artisans&status=verified"
          />
          <Tuile
            libelle="En attente de validation"
            valeur={enAttente}
            ton={enAttente > 0 ? 'alerte' : 'neutre'}
            to="/admin?section=artisans&status=pending"
          />
          <Tuile
            libelle="Masquées"
            valeur={masquees}
            detail="Retirées de la recherche, fiches conservées"
            to="/admin?section=artisans&status=hidden"
          />
        </div>
      </section>

      <section aria-labelledby="titre-activite">
        <h3 id="titre-activite" className="mb-3 font-bold">
          Activité
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Tuile
            libelle="Métiers au catalogue"
            valeur={valeur.servicesActive}
            detail="Référentiel des listes déroulantes"
            to="/admin?section=referentiels"
          />
          <Tuile
            libelle="Avis publiés"
            valeur={valeur.reviews}
            detail="Comptabilisés dans la note des fiches"
            to="/admin?section=avis"
          />
          <Tuile libelle="Favoris enregistrés" valeur={valeur.favorites} />
        </div>
        {valeur.reviews === 0 ? (
          <div className="mt-4">
            <EtatVide
              icone="rate_review"
              titre="Aucun avis publié"
              corps="Les avis laissés par les clients sur un profil apparaîtront ici, et compteront dans la note de la fiche."
            />
          </div>
        ) : null}
      </section>
    </>
  )
}
