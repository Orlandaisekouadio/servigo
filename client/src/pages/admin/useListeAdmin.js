// Chargement paginé des listes du back-office.
//
// Une seule requête par jeu de critères : le filtre courant est résumé dans une
// clé, et l'affichage se déduit de la comparaison entre cette clé et celle qui
// a produit les lignes affichées. `chargement` est donc vrai dès la première
// frappe, sans avoir à remettre l'état à vrai dans un effet — ce qui coûterait
// un rendu supplémentaire à chaque frappe de clavier.
import { useCallback, useEffect, useState } from 'react'
import { getErrorMessage } from '../../lib/api'

// Attente avant d'envoyer la recherche : une requête par frappe saturerait
// l'API sans rien apprendre de plus.
const DELAI_RECHERCHE_MS = 300

const defauts = (o) => ({ q: '', page: 1, ...o })

/**
 * @param {(criteres: object) => Promise<{data?: any[], total?: number}>} lecteur
 *   Fonction de lecture : reçoit `{ q, page, ...filtres }`, renvoie la page
 *   demandée.
 * @param {object} criteresInitiaux Filtres autres que `q` et `page`.
 */
export function useListeAdmin(lecteur, criteresInitiaux = {}) {
  const [criteres, setCriteres] = useState(() => defauts(criteresInitiaux))
  const [q, setQ] = useState(() => defauts(criteresInitiaux).q)
  const [qDiffere, setQDiffere] = useState(() => defauts(criteresInitiaux).q)
  // Incrémenté après une écriture pour rejouer la requête à l'identique.
  const [relance, setRelance] = useState(0)
  const [etat, setEtat] = useState({ clef: null, data: [], total: 0, erreur: '' })

  useEffect(() => {
    const id = setTimeout(() => setQDiffere(q), DELAI_RECHERCHE_MS)
    return () => clearTimeout(id)
  }, [q])

  // Résumé des critères ayant produit l'affichage en cours. La requête est
  // déclenchée par un changement de cette clé : un filtre qui ne change rien de
  // visible ne relance rien.
  const cle = JSON.stringify([qDiffere, criteres, relance])

  useEffect(() => {
    let annule = false
    lecteur({ ...criteres, q: qDiffere })
      .then((res) => {
        if (annule) return
        setEtat({ clef: cle, data: res?.data ?? [], total: res?.total ?? 0, erreur: '' })
      })
      .catch((err) => {
        if (annule) return
        setEtat({ clef: cle, data: [], total: 0, erreur: getErrorMessage(err) })
      })
    return () => {
      annule = true
    }
  }, [cle, qDiffere, criteres, lecteur])

  /** Applique un filtre : il replace la liste à la première page. */
  const setFiltre = useCallback((nom, valeur) => {
    setCriteres((c) => ({ ...c, [nom]: valeur, page: 1 }))
  }, [])

  const changerPage = useCallback((p) => {
    setCriteres((c) => ({ ...c, page: p }))
  }, [])

  const recharger = useCallback(() => setRelance((n) => n + 1), [])

  return {
    q,
    setQ,
    criteres,
    setFiltre,
    page: criteres.page ?? 1,
    changerPage,
    recharger,
    lignes: etat.data,
    total: etat.total,
    chargement: etat.clef !== cle,
    erreur: etat.erreur,
  }
}
