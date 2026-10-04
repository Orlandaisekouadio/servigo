// Bouton de favori, réutilisé sur les cartes de la recherche et sur la fiche
// publique de l'artisan. Purement présentational : l'état (chargé, en cours,
// favori) est fourni par le hook `useFavorites`, appelé une seule fois par page
// pour que les cartes ne lancent pas chacune leur requête.
export default function FavouriteButton({
  slug,
  name,
  variant = 'overlay',
  isFavorite,
  onToggle,
  pending = false,
  ready = true,
  className = '',
}) {
  if (!slug) return null;

  const actif = Boolean(isFavorite);
  const occupe = pending === slug;

  // Tant que la liste n'est pas arrivée, on affiche un cœur neutre et inactif :
  // annoncer « pas favori » avant la réponse ferait scintiller le cœur de tous
  // les artisans de la page.
  const inconnu = !ready;

  const base =
    variant === 'inline'
      ? 'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors disabled:cursor-wait'
      : 'flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-sm transition-colors hover:bg-white disabled:cursor-wait';

  const teinte = inconnu
    ? variant === 'inline'
      ? 'border-slate-200 bg-slate-50 text-slate-400'
      : 'text-slate-300'
    : actif
      ? variant === 'inline'
        ? 'border-primary/30 bg-primary/10 text-primary'
        : 'text-primary'
      : variant === 'inline'
        ? 'border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary'
        : 'text-slate-500 hover:text-primary';

  const libelle = inconnu
    ? 'Chargement de vos favoris'
    : actif
      ? `Retirer ${name} des favoris`
      : `Ajouter ${name} aux favoris`;

  const texte = variant === 'inline' ? (inconnu ? 'Vérification…' : actif ? 'Dans mes favoris' : 'Ajouter aux favoris') : null;

  return (
    <button
      type="button"
      onClick={() => onToggle(slug)}
      disabled={inconnu || occupe}
      aria-pressed={!inconnu && actif}
      aria-busy={occupe}
      aria-label={libelle}
      title={libelle}
      className={`${base} ${teinte} ${className}`}
    >
      <span className="material-symbols-outlined text-xl" aria-hidden="true">
        {actif ? 'favorite' : 'favorite_border'}
      </span>
      {texte && <span>{texte}</span>}
    </button>
  );
}