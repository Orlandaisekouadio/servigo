import { apiRequest } from '../lib/api'

// Recherche de la vitrine. Les paramètres vides sont omis pour que la route
// garde ses valeurs par défaut côté serveur (source de vérité des filtres).
export async function listArtisans({
  q = '',
  service = '',
  commune = '',
  minNote = 0,
  disponible,
  sort = 'reviews',
  page = 1,
  limit = 50,
} = {}) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (service) params.set('service', service)
  if (commune) params.set('commune', commune)
  if (minNote > 0) params.set('minNote', String(minNote))
  if (typeof disponible === 'boolean') params.set('disponible', String(disponible))
  if (sort) params.set('sort', sort)
  if (page > 1) params.set('page', String(page))
  if (limit) params.set('limit', String(limit))
  return apiRequest(`/artisans?${params.toString()}`)
}

export async function getMyArtisanProfile() {
  return apiRequest('/artisans/me')
}

export async function updateMyArtisanProfile(data) {
  return apiRequest('/artisans/me', {
    method: 'PATCH',
    body: data,
  })
}

export async function getMyStats() {
  return apiRequest('/artisans/me/stats')
}

export async function getPublicProfile(slug) {
  return apiRequest(`/artisans/${encodeURIComponent(slug)}`)
}

export async function listMyGallery() {
  return apiRequest('/artisans/me/gallery')
}

// Envoi d'une photo : multipart/form-data, champ fichier « file » (multer) + la légende.
export async function uploadGalleryPhoto({ file, title, subtitle = '', text = '' }) {
  const form = new FormData()
  form.append('title', title)
  if (subtitle) form.append('subtitle', subtitle)
  if (text) form.append('text', text)
  form.append('file', file)
  return apiRequest('/artisans/me/gallery', { method: 'POST', body: form })
}

export async function deleteGalleryPhoto(id) {
  return apiRequest(`/artisans/me/gallery/${id}`, { method: 'DELETE' })
}

export async function updateProfileAvailability(available, availableLabel) {
  return apiRequest('/artisans/me', {
    method: 'PATCH',
    body: { available, availableLabel },
  })
}