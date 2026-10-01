// Compte client de démonstration — source unique partagée par la nav (menu avatar)
// et l'espace client, pour que le nom affiché ne puisse pas diverger entre les deux.
// Reprend une cliente déjà présente dans les avis publics (cf. reviews.js).
export const clientAccount = {
  name: 'Aïcha Coulibaly',
  initials: 'AC',
  avatar: '/images/awa.png',
  location: 'Cocody',
  memberSince: 'Mars 2025',
  // Rappel d'honnêteté affiché sous le menu de la nav : la session est simulée.
  sessionNotice: 'Session de démonstration — aucun compte réel n’est créé.',
}
