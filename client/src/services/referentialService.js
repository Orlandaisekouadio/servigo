import { apiRequest } from '../lib/api'

// Communes desservies — GET /api/communes
// Alimente les listes déroulantes de l'inscription et de la recherche, ainsi que
// la détection de commune saisie en texte libre sur la page d'accueil.
//
// Route publique : aucune session requise, d'où l'absence de `credentials`.
export async function listCommunes() {
  return apiRequest('/communes', { credentials: 'omit' })
}