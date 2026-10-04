// Formatage d'affichage partagé.
//
// Le séparateur décimal était réécrit à la main dans neuf composants
// (`String(x).replace('.', ',')`), avec deux variantes concurrentes
// (`toFixed(1)` sur une page, `String()` ailleurs) : une note diarthèse pouvait
// donc s'afficher « 4.8 » selon l'écran. La conversion est ici, une fois.

// Note sur 5 au format français (« 4,8 »). `toFixed(1)` garantit une décimale :
// sans lui, une note entière s'afficherait « 5 » à côté de « 4,8 » sur la même
// ligne et les colonnes de notes paraîtraient désalignées.
export const noteFr = (n, decimales = 1) =>
  Number(n ?? 0).toFixed(decimales).replace('.', ',');

// Nombre entier sexué : « 1 artisan », « 3 artisans ».
export const pluriel = (n, singulier, plurielMot = `${singulier}s`) =>
  `${n} ${n > 1 ? plurielMot : singulier}`;