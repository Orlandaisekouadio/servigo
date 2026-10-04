// Avis — liste, filtre et suppression.
//
// La suppression est irréversible : elle efface l'avis, recalcule la note de la
// fiche et inscrit l'action au journal d'administration. L'écran le dit avant de
// confirmer plutôt que de laisser croire qu'un avis attesté serait protégé — il
// ne l'est pas, et le dire permettrait de le supprimer sans le savoir.
import { useState } from 'react'
import { deleteReview, listAdminReviews } from '../../services/adminService'
import { useListeAdmin } from './useListeAdmin'
import {
  BoutonIcone,
  Chargement,
  Confirmation,
  Entete,
  EtatVide,
  Pagination,
  Recherche,
  Retours,
} from './ui'

const NOTES = [
  { value: '', label: 'Toutes les notes' },
  { value: '1', label: '1 étoile' },
  { value: '2', label: '2 étoiles' },
  { value: '3', label: '3 étoiles' },
  { value: '4', label: '4 étoiles' },
  { value: '5', label: '5 étoiles' },
]

export default function PanneauAvis() {
  const liste = useListeAdmin(listAdminReviews, { rating: '' })
  const [aSupprimer, setASupprimer] = useState(null)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState('')
  const [fait, setFait] = useState('')

  const supprimer = async () => {
    const cible = aSupprimer
    setEnCours(true)
    setErreur('')
    setFait('')
    try {
      await deleteReview(cible._id)
      setFait('Avis supprimé. La note de la fiche a été recalculée.')
      liste.recharger()
    } catch (err) {
      setErreur(err?.message ?? 'Suppression impossible.')
    } finally {
      setEnCours(false)
      setASupprimer(null)
    }
  }

  return (
    <>
      <Entete
        titre="Avis clients"
        description="Les avis laissés sur les fiches. Une suppression recalcule la note de la fiche concernée."
      >
        <div className="flex items-center gap-3">
          <label className="sr-only" htmlFor="filtre-note">
            Filtrer par note
          </label>
          <select
            id="filtre-note"
            value={liste.criteres.rating}
            onChange={(e) => liste.setFiltre('rating', e.target.value)}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"
          >
            {NOTES.map((n) => (
              <option key={n.value} value={n.value}>
                {n.label}
              </option>
            ))}
          </select>
          <Recherche
            id="recherche-avis"
            valeur={liste.q}
            onChange={liste.setQ}
            placeholder="Texte, auteur…"
          />
        </div>
      </Entete>

      <Retours succes={fait} erreur={erreur || liste.erreur} className="mb-4" />

      {liste.chargement ? (
        <Chargement />
      ) : liste.lignes.length === 0 ? (
        <EtatVide
          icone="rate_review"
          titre="Aucun avis pour ce filtre"
          corps="Changez de filtre ou effacez la recherche."
        />
      ) : (
        <>
          <ul className="space-y-3">
            {liste.lignes.map((avis) => (
              <li
                key={avis._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: avis.rating }, (_, i) => (
                        <span key={i} className="material-symbols-outlined text-sm" aria-hidden="true">
                          star
                        </span>
                      ))}
                      <span className="sr-only">{avis.rating} étoile(s) sur 5</span>
                      <span className="ml-2 text-sm font-semibold text-on-surface-variant">
                        {avis.rating}/5
                      </span>
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {avis.authorName ?? avis.author?.name ?? 'Auteur supprimé'}
                      {avis.verified ? (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-xs text-primary-deep">
                          <span className="material-symbols-outlined text-sm" aria-hidden="true">
                            verified
                          </span>
                          Vérifié
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Sur {avis.artisan?.name ?? 'fiche supprimée'}
                      {avis.location ? ` · ${avis.location}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <time
                      dateTime={avis.createdAt}
                      className="text-xs text-on-surface-variant"
                    >
                      {new Date(avis.createdAt).toLocaleDateString('fr-FR')}
                    </time>
                    <BoutonIcone
                      libelle={`Supprimer l'avis de ${avis.authorName ?? 'cet auteur'}`}
                      variante="discretDanger"
                      disabled={enCours}
                      onClick={() => setASupprimer(avis)}
                    >
                      <span className="material-symbols-outlined text-lg" aria-hidden="true">
                        delete
                      </span>
                    </BoutonIcone>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed">{avis.text}</p>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <Pagination page={liste.page} total={liste.total} onChange={liste.changerPage} />
          </div>
        </>
      )}

      <Confirmation
        ouvert={Boolean(aSupprimer)}
        titre="Supprimer cet avis ?"
        corps="L'avis disparaît du site, la note de la fiche est recalculée et l'action est inscrite au journal d'administration. Cette action est irréversible, y compris pour un avis marqué « vérifié »."
        onConfirmer={supprimer}
        onAnnuler={() => setASupprimer(null)}
        enCours={enCours}
      />
    </>
  )
}
