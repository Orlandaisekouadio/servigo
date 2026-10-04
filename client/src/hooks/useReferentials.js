// Référentiels du site : métiers (services) et communes.
//
// Servis depuis l'API, donc administrables : ajouter une commune ne demande ni
// redéploiement ni modification d'une constante côté client.
//
// Le cache est au niveau du module et vit le temps de la session. Un référentiel
// change rarement — seulement quand un admin le modifie — et trois écrans le
// consomment (inscription, recherche, page d'accueil). Sans cache partagé, une
// simple navigation en déclencherait trois appels identiques.
//
// Conséquence assumée : un admin qui modifie un référentiel ne voit pas le
// changement sur un écran déjà ouvert. `rafraichir()` est fourni pour les cas
// où il faut forcer la relecture.
import { useCallback, useEffect, useState } from 'react';
import { listServices } from '../services/catalogService';
import { listCommunes } from '../services/referentialService';
import { getErrorMessage } from '../lib/api';

function creerChargeur(lecture) {
  // { promesse, valeur } : `promesse` mémorise l'appel en cours pour que deux
  // composants montés dans la même passe partagent une seule requête.
  let etat = { promesse: null, valeur: null };

  return async () => {
    if (etat.valeur) return etat.valeur;
    if (!etat.promesse) etat.promesse = lecture();
    try {
      const res = await etat.promesse;
      etat.valeur = res?.data ?? [];
      etat.promesse = null;
      return etat.valeur;
    } catch (err) {
      // Un échec ne doit pas rester en cache : sinon le référentiel serait
      // définitivement marqué « vide » jusqu'au rechargement de la page.
      etat.promesse = null;
      throw err;
    }
  };
}

const chargerServices = creerChargeur(listServices);
const chargerCommunes = creerChargeur(listCommunes);

function useReferentiel(chargeur) {
  const [etat, setEtat] = useState(() => ({ clef: null, valeur: [], erreur: '' }));

  const rafraichir = useCallback(() => {
    const clef = `${Date.now()}-${Math.random()}`;
    setEtat({ clef, valeur: [], erreur: '' });
    return chargeur()
      .then((valeur) => setEtat({ clef, valeur, erreur: '' }))
      .catch((err) => setEtat({ clef, valeur: [], erreur: getErrorMessage(err) }));
  }, [chargeur]);

  useEffect(() => {
    let annule = false;
    const clef = 'initial';
    chargeur()
      .then((valeur) => {
        if (!annule) setEtat({ clef, valeur, erreur: '' });
      })
      .catch((err) => {
        if (!annule) setEtat({ clef, valeur: [], erreur: getErrorMessage(err) });
      });
    return () => {
      annule = true;
    };
  }, [chargeur]);

  return {
    valeur: etat.valeur,
    chargement: etat.clef === null,
    erreur: etat.erreur,
    rafraichir,
  };
}

/** Métiers du catalogue, actifs uniquement (l'API filtre les désactivés). */
export function useServices() {
  return useReferentiel(chargerServices);
}

/** Communes desservies, dans l'ordre défini par l'admin. */
export function useCommunes() {
  return useReferentiel(chargerCommunes);
}