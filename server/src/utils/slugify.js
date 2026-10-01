// Slug ASCII à partir d'un libellé : « Électricien » -> « electricien ».
// Les diacritiques sont retirés via NFD + suppression des marques combinantes.
export function slugify(value, maxLength = 60) {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, maxLength)
    .replace(/-$/, '');
}
