// Carte artisan — rendu unique pour toute la vitrine.
//
// Extraite de la page de recherche, qui faisait référence : photo en 16/9,
// pastille de disponibilité, note, localisation, appel à l'action. Elle sert
// désormais aussi la page d'accueil, qui avait son propre dessin (avatar rond,
// bouton WhatsApp, bouton « Appeler ») — deux façons de présenter le même
// artisan sur deux écrans du même site.
//
// La carte ne connaît pas les favoris : les props sont facultatives, ce qui
// permet à une grille qui en affiche (recherche) de brancher son hook sans que
// la page d'accueil soit obligée de le faire.
import { Link } from 'react-router-dom';
import { assetUrl } from '../lib/api';
import { noteFr } from '../lib/format';
import FavouriteButton from './FavouriteButton';

export default function ArtisanCard({
  artisan: a,
  favourite,
  rank,
  className = '',
}) {
  if (!a) return null;

  const lieu = a.location || a.commune;
  const sansAvis = !(a.reviewsCount > 0);

  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg ${className}`}
    >
      <div className="relative">
        {a.avatarUrl ? (
          <img
            src={assetUrl(a.avatarUrl)}
            alt={`${a.name}, ${a.role}`}
            loading="lazy"
            className="h-64 w-full object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-64 w-full items-center justify-center bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-6xl text-slate-300">store</span>
          </div>
        )}

        <span
          className={`absolute top-4 left-4 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-white shadow ${
            a.available ? 'bg-primary' : 'bg-accent'
          }`}
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">
            {a.available ? 'verified' : 'schedule'}
          </span>
          {a.available ? 'Disponible' : a.availableLabel || 'Indisponible'}
        </span>

        {favourite ? (
          <FavouriteButton
            slug={a.slug}
            name={a.name}
            isFavorite={favourite.isFavorite}
            onToggle={favourite.onToggle}
            pending={favourite.pending}
            ready={favourite.ready}
            className="absolute top-4 right-4"
          />
        ) : null}

        {/* Rang « mieux noté » : pastille posée par la page d'accueil, hors du
            flux de la carte pour qu'elle reste réutilisable telle quelle. */}
        {rank ? (
          <span
            className={`absolute bottom-4 left-4 rounded-full px-3.5 py-1.5 text-xs font-bold shadow ${rank.className}`}
          >
            {rank.label}
          </span>
        ) : null}
      </div>

      <div className="flex grow flex-col p-7">
        <h2 className="text-xl font-bold">{a.name}</h2>
        <p className="mt-1 text-sm text-slate-500">{a.role}</p>

        {sansAvis ? (
          <p className="mt-3 text-[15px] text-slate-500">Aucun avis pour l&apos;instant</p>
        ) : (
          <p className="mt-3 flex items-center gap-1.5 text-[15px]">
            <span className="material-symbols-outlined text-lg text-accent" aria-hidden="true">
              star
            </span>
            <span className="font-bold">{noteFr(a.rating)}</span>
            <span className="text-slate-500">({a.reviewsCount} avis)</span>
            <span className="sr-only">Note {noteFr(a.rating)} sur 5</span>
          </p>
        )}

        {lieu ? (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              location_on
            </span>
            {lieu}
          </p>
        ) : null}

        {/* `mt-auto` colle le bouton au bas : les cartes d'une même rangée
            s'alignent même si l'une a une localisation et pas l'autre. Le
            `pt-1.5` fait l'écart interne, que `mt-auto` neutraliserait. */}
        {a.slug ? (
          <Link
            to={`/artisan/${a.slug}`}
            className="mt-auto flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 pt-1.5 font-semibold text-white transition-colors hover:bg-primary-deep"
          >
            Voir le profil
          </Link>
        ) : null}
      </div>
    </article>
  );
}