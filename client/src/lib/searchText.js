const norm = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/-/g, ' ')
    .trim()

// Retrouve la commune correspondant à un lieu saisi en texte libre
// (« deux plateaux » -> « Deux-Plateaux / Vallons »).
//
// La liste des communes vient de l'appelant (l'API) et non d'une constante
// locale : le référentiel est administrable, une copie ici repartagerait avec
// la base et la recognizing ignorait les communes ajoutées depuis.
//
// Une saisie qui ne correspond à aucune commune connue renvoie null et reste
// traitée comme un terme de recherche libre : mieux vaut une recherche large
// qu'un filtre restrictif sur une commune supposée.
export function matchCommune(text, communes = []) {
  const t = norm(text || '')
  if (!t || !communes.length) return null
  for (const c of communes) {
    const nom = typeof c === 'string' ? c : c?.name
    if (!nom) continue
    const tokens = norm(nom).split(/[/\s]+/).filter(Boolean)
    // Les tokens de moins de 4 lettres (« le », « de ») sont ignorés : ils
    // apparaîtraient dans presque toutes les communes, et la première trouvée
    // gagnerait à tous les coups.
    if (tokens.some((tok) => tok.length > 3 && t.includes(tok)) || t.includes(norm(nom))) return nom
  }
  return null
}
