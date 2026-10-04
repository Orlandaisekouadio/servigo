import { apiRequest } from '../lib/api'

// Catalogue des métiers : sert de source de vérité pour le choix de la
// spécialité à l'inscription. L'API rapproche ensuite cette spécialité du
// service correspondant pour le rattacher au profil de l'artisan.
export async function listServices() {
  return apiRequest('/services')
}