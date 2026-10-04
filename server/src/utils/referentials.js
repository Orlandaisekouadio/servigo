// Contrôle des référentiels administrables (communes, services).
//
// Les listes déroulantes du front sont alimentées par l'API, donc une valeur
// hors catalogue ne peut plus venir d'un formulaire. Elle peut en revanche venir
// d'un client ancien, d'un script ou d'une saisie directe : sans cette
// validation, la base accumulerait des communes fantômes invisibles dans
// l'interface, et la recherche sur cette commune ne renverrait jamais rien.
import { Commune } from '../models/Commune.js';
import { Service } from '../models/Service.js';

/**
 * Commune connue du catalogue.
 *
 * @param {string} nom
 * @param {{ allowInactive?: boolean }} options
 *   `allowInactive` laisse passer une commune désactivée par l'admin. Indispensable
 *   pour les comptes existants : désactiver « Cocody » ne doit pas empeiller un
 *   artisan déjà installé de enregistrer une modification de profil.
 * @returns {Promise<boolean>}
 */
export async function isKnownCommune(nom, { allowInactive = false } = {}) {
  const valeur = String(nom ?? '').trim();
  if (!valeur) return false;
  const filter = allowInactive ? { name: valeur } : { name: valeur, active: { $ne: false } };
  return Boolean(await Commune.exists(filter));
}

/**
 * Service (métier) connu du catalogue.
 *
 * La comparaison porte sur le nom exact : c'est la clé que
 * `GET /api/artisans?service=` et `findServiceBySpecialite` comprehendent.
 *
 * @param {string} nom
 * @returns {Promise<boolean>}
 */
export async function isKnownService(nom) {
  const valeur = String(nom ?? '').trim();
  if (!valeur) return false;
  return Boolean(await Service.exists({ name: valeur, active: { $ne: false } }));
}