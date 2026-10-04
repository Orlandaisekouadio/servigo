// Helpers d'identité partagée entre la barre de navigation et les espaces
// personnel : l'API renvoie un compte « brut », l'interface a besoin d'un nom
// affichable, d'initiales et d'un rôle lisible.

export const initialsOf = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

export const roleLabel = (role) =>
  role === 'artisan' ? 'Artisan' : role === 'admin' ? 'Administrateur' : 'Client'

export const MEMBER_SINCE = {
  0: "aujourd'hui",
  1: 'il y a un mois',
  2: 'il y a 2 mois',
  3: 'il y a 3 mois',
  6: 'il y a 6 mois',
  12: 'il y a un an',
}

export function memberSinceLabel(createdAt) {
  if (!createdAt) return ''
  const months = Math.max(
    0,
    Math.floor((Date.now() - new Date(createdAt).getTime()) / (30 * 24 * 3600 * 1000)),
  )
  if (months === 0) return "aujourd'hui"
  if (months < 12) return `il y a ${months} mois`
  const years = Math.floor(months / 12)
  return years === 1 ? 'il y a un an' : `il y a ${years} ans`
}