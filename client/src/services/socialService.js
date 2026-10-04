import { apiRequest } from '../lib/api'

// Une URL absolue est déjà prête ; sinon on interroge la route publique du
// profil, qui lit la base et joint le nom du métier.
function artisanPath(idOrSlug) {
  return `/artisans/${encodeURIComponent(idOrSlug)}`
}

export async function listFavorites() {
  return apiRequest('/favorites')
}

export async function addFavorite(slug) {
  return apiRequest('/favorites', { method: 'POST', body: { artisan: slug } })
}

export async function removeFavorite(artisanId) {
  return apiRequest(`/favorites/${encodeURIComponent(artisanId)}`, { method: 'DELETE' })
}

export async function listMyReviews() {
  return apiRequest('/reviews/me')
}

// Avis publics récents (bandeau de l'accueil). La route est publique : aucune
// session n'est requise, d'où l'absence de `credentials`.
export async function listRecentReviews(limit = 6) {
  return apiRequest(`/reviews/recent?limit=${limit}`, { credentials: 'omit' })
}

export async function deleteMyReview(id) {
  return apiRequest(`/reviews/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function createReview({ artisan, rating, text, service, location }) {
  return apiRequest('/reviews', {
    method: 'POST',
    body: { artisan, rating, text, service, location },
  })
}

export { artisanPath }