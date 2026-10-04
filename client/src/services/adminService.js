import { apiRequest } from '../lib/api'

// Appels du back-office. Toutes les routes sont protégées côté API par
// `protect` + `restrictTo('admin')` : un 403 ici signifie que le rôle du compte
// a été retiré en cours de session, pas que l'écran est mal construit.
//
// Les réponses sont paginées (`{ data, page, limit, total }`) sauf les
// référentiels, qui renvoient la liste complète avec le nombre d'artisans
// rattachés par cible — nécessaire pour afficher « suppression impossible ».

/** Compteurs de la vue d'ensemble. */
export async function getAdminStats() {
  return apiRequest('/admin/stats')
}

// --- Référentiels : métiers --------------------------------------------

export async function listAdminServices() {
  return apiRequest('/admin/services')
}

export async function createService(body) {
  return apiRequest('/admin/services', { method: 'POST', body })
}

export async function updateService(id, body) {
  return apiRequest(`/admin/services/${id}`, { method: 'PATCH', body })
}

export async function deleteService(id) {
  return apiRequest(`/admin/services/${id}`, { method: 'DELETE' })
}

// --- Référentiels : communes -------------------------------------------

export async function listAdminCommunes() {
  return apiRequest('/admin/communes')
}

export async function createCommune(body) {
  return apiRequest('/admin/communes', { method: 'POST', body })
}

export async function updateCommune(id, body) {
  return apiRequest(`/admin/communes/${id}`, { method: 'PATCH', body })
}

export async function deleteCommune(id) {
  return apiRequest(`/admin/communes/${id}`, { method: 'DELETE' })
}

// --- Artisans -----------------------------------------------------------

export async function listAdminArtisans({ q = '', status = 'all', page = 1 } = {}) {
  const params = new URLSearchParams({ q, status, page: String(page) })
  return apiRequest(`/admin/artisans?${params}`)
}

export async function getAdminArtisan(id) {
  return apiRequest(`/admin/artisans/${id}`)
}

export async function updateAdminArtisan(id, body) {
  return apiRequest(`/admin/artisans/${id}`, { method: 'PATCH', body })
}

// --- Avis ---------------------------------------------------------------

export async function listAdminReviews({ q = '', rating = '', page = 1 } = {}) {
  const params = new URLSearchParams({ q, page: String(page) })
  if (rating) params.set('rating', rating)
  return apiRequest(`/admin/reviews?${params}`)
}

export async function deleteReview(id) {
  return apiRequest(`/admin/reviews/${id}`, { method: 'DELETE' })
}

// --- Comptes ------------------------------------------------------------

export async function listAdminUsers({ q = '', role = 'all', page = 1 } = {}) {
  const params = new URLSearchParams({ q, role, page: String(page) })
  return apiRequest(`/admin/users?${params}`)
}

export async function updateAdminUser(id, body) {
  return apiRequest(`/admin/users/${id}`, { method: 'PATCH', body })
}

export async function sendUserReset(id) {
  return apiRequest(`/admin/users/${id}/reset-link`, { method: 'POST' })
}

// --- Journal d'administration -------------------------------------------

export async function listAdminLog({ q = '', page = 1 } = {}) {
  const params = new URLSearchParams({ q, page: String(page) })
  return apiRequest(`/admin/log?${params}`)
}
