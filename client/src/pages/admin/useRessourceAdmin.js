// Chargement d'une ressource unique du back-office, rejouable après une écriture.
//
// Même schéma que `useListeAdmin` : la clé de requête est stockée avec les
// données, et l'affichage se déduit de la comparaison des deux. Un écran n'a
// donc pas à remettre son état à « chargement » dans un effet — ce qui
// coûterait un rendu de plus à chaque écriture.
import { useCallback, useEffect, useState } from 'react'
import { getErrorMessage } from '../../lib/api'

/**
 * @param {() => Promise<any>} lecteur Renvoie la ressource entière.
 * @returns {{valeur: any, chargement: boolean, erreur: string, recharger: () => void}}
 *   `valeur` vaut `null` tant que la ressource n'a jamais été lue.
 */
export function useRessourceAdmin(lecteur) {
  const [relance, setRelance] = useState(0)
  const [etat, setEtat] = useState({ clef: null, valeur: null, erreur: '' })

  // La clé est la somme de la relance et du nom de la fonction : deux
  // appels au même écran ne partagent pas leur clé, un même appel rejoué change
  // de clé. Le nom de la fonction — et non son identité — est utilisé parce que
  // tous les lecteurs passés ici sont des fonctions de module.
  const cle = JSON.stringify([relance, lecteur.name])

  useEffect(() => {
    let annule = false
    lecteur()
      .then((res) => {
        if (annule) return
        setEtat({ clef: cle, valeur: res?.data ?? [], erreur: '' })
      })
      .catch((err) => {
        if (annule) return
        setEtat({ clef: cle, valeur: [], erreur: getErrorMessage(err) })
      })
    return () => {
      annule = true
    }
  }, [cle, lecteur])

  const recharger = useCallback(() => setRelance((n) => n + 1), [])

  return { valeur: etat.valeur, chargement: etat.clef !== cle, erreur: etat.erreur, recharger }
}

/**
 * Écriture unique : `appliquer` reçoit le corps, l'API répond, la liste est
 * rechargée et l'outcome est rendu à l'écran. Les refus de l'API — nom déjà
 * pris, commune habitée, rôle protégé — sont affichés tels qu'elle les formule
 * plutôt que traduits en « une erreur est survenue ».
 */
export function useEcritureAdmin(appliquer) {
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')

  const ecrire = useCallback(
    async (corps, messageSucces) => {
      setEnCours(true)
      setErreur('')
      setSucces('')
      try {
        await appliquer(corps)
        setSucces(messageSucces)
        return true
      } catch (err) {
        setErreur(getErrorMessage(err))
        return false
      } finally {
        setEnCours(false)
      }
    },
    [appliquer]
  )

  return { enCours, erreur, succes, ecrire, setErreur, setSucces }
}
