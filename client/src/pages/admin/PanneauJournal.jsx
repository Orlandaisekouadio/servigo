// Journal d'administration — qui a fait quoi, sur quelle cible, quand.
//
// Ce que le serveur écrit (`audit()`) est la seule trace des mutations
// d'administration. L'écran est en lecture seule : il n'existe aucune route pour
// modifier une entrée, et il n'y en aura pas — un journal que l'on peut
// réécrire ne prouve rien.
//
// `targetId` n'est volontairement pas peuplé côté serveur : il pointe tantôt vers
// un profil, tantôt vers un compte ou un avis, sans référence unique. L'écran
// affiche donc le type et l'identifiant brut, sans fabriquer de lien qui
// supposerait une correspondance.
import { listAdminLog } from '../../services/adminService'
import { useListeAdmin } from './useListeAdmin'
import {
  Chargement,
  Entete,
  EtatVide,
  Pagination,
  Recherche,
  Retours,
} from './ui'

const CIBLES = {
  service: 'Métier',
  commune: 'Commune',
  artisan: 'Fiche artisan',
  user: 'Compte',
  review: 'Avis',
}

const ACTIONS = {
  'service.create': 'Création',
  'service.update': 'Modification',
  'service.delete': 'Suppression',
  'commune.create': 'Création',
  'commune.update': 'Modification',
  'commune.delete': 'Suppression',
  'artisan.update': 'Modification',
  'user.update': 'Modification',
  'review.delete': 'Suppression',
}

export default function PanneauJournal() {
  const liste = useListeAdmin(listAdminLog)

  return (
    <>
      <Entete
        titre="Journal d'administration"
        description="Chaque écriture faite depuis ce back-office est inscrite ici avec son auteur. Le journal est en lecture seule : aucune de ses entrées ne peut être modifiée ni supprimée."
      >
        <Recherche
          id="recherche-journal"
          valeur={liste.q}
          onChange={liste.setQ}
          placeholder="Action, type de cible…"
        />
      </Entete>

      <Retours erreur={liste.erreur} className="mb-4" />

      {liste.chargement ? (
        <Chargement />
      ) : liste.lignes.length === 0 ? (
        <EtatVide
          icone="history"
          titre="Aucune écriture pour ce filtre"
          corps="Le journal se remplit dès la première modification faite depuis ce back-office."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-surface-container-low">
                <tr>
                  {['Quand', 'Auteur', 'Action', 'Cible', 'Détails'].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-4 py-3 text-xs font-bold tracking-wider text-on-surface-variant uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {liste.lignes.map((entree) => (
                  <tr key={entree._id}>
                    <td className="whitespace-nowrap align-top">
                      <time dateTime={entree.createdAt}>
                        {new Date(entree.createdAt).toLocaleString('fr-FR')}
                      </time>
                    </td>
                    <td className="align-top">
                      <p className="font-medium">{entree.actor?.name ?? 'Compte supprimé'}</p>
                      <p className="text-xs text-on-surface-variant">{entree.actor?.email ?? '—'}</p>
                    </td>
                    <td className="align-top">
                      {ACTIONS[entree.action] ?? entree.action}
                    </td>
                    <td className="align-top">
                      <p className="font-medium">
                        {CIBLES[entree.targetType] ?? entree.targetType}
                      </p>
                      {entree.targetId ? (
                        <p className="font-mono text-xs text-on-surface-variant">
                          {entree.targetId}
                        </p>
                      ) : null}
                    </td>
                    <td className="align-top">
                      <Details entree={entree} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6">
            <Pagination page={liste.page} total={liste.total} onChange={liste.changerPage} />
          </div>
        </>
      )}
    </>
  )
}

// Les détails sont un objet libre : ce que l'API a choisi d'y mettre dépend de
// l'action. On les rend en JSON lisible plutôt que d'inventer des colonnes,
// ce qui masquerait un champ nouveau au lieu de le montrer.
function Details({ entree }) {
  const contenu = entree.details
  const vide =
    !contenu ||
    (typeof contenu === 'object' && Object.keys(contenu).length === 0)
  if (vide) return <span className="text-on-surface-variant">—</span>
  return (
    <details>
      <summary className="cursor-pointer text-xs font-semibold text-primary">
        Voir les changements
      </summary>
      <pre className="mt-2 max-w-md overflow-x-auto rounded-lg bg-surface-container-low p-3 text-xs whitespace-pre-wrap">
        {JSON.stringify(contenu, null, 2)}
      </pre>
    </details>
  )
}
