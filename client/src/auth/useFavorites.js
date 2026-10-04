// Lecture et bascule des favoris. La liste est chargée UNE fois par page et
// exposée par slug : les cartes de la recherche ne relancent donc pas une
// requête chacune. L'API renvoie déjà l'artisan joint (slug + identifiant), ce
// qui suffit à savoir si un artisan est en favori et à le retirer ensuite.
//
// Fichier séparé de tout composant pour la règle oxlint
// `react/only-export-components`.
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { getErrorMessage } from '../lib/api';
import { addFavorite, listFavorites, removeFavorite } from '../services/socialService';
import { useAuth } from './useAuth';

// Identifiant provisoire : l'artisan vient d'être ajouté, on ne connaît pas
// encore son `_id` tant que la réponse n'est pas revenue.
const PENDING_ID = '';

// Partagée et jamais modifiée : un visiteur non connecté n'a aucun favori, on
// n'a donc pas à écrire dans l'état pour le représenter.
const AUCUN_FAVORI = new Map();

function toMap(data) {
  return new Map(
    (data ?? [])
      .filter((f) => f?.artisan?.slug)
      .map((f) => [f.artisan.slug, f.artisan._id]),
  );
}

export function useFavorites() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // null tant que la lecture n'a pas abouti : `ready` distingue « pas encore
  // chargé » de « chargé et vide », pour ne pas faire clignoter un cœur vide.
  const [charge, setCharge] = useState(null);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState('');

  // Sans session, la liste est vide et connue : aucun état n'est nécessaire.
  const bySlug = user ? charge : AUCUN_FAVORI;

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    listFavorites()
      .then((res) => {
        if (!cancelled) setCharge(toMap(res?.data));
      })
      .catch((err) => {
        // Un échec de lecture ne doit pas laisser les cœurs bloqués : on affiche
        // la liste vide et on remonte le motif, le clic pouvant retenter.
        if (cancelled) return;
        setCharge(new Map());
        setError(getErrorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const isFavorite = useCallback((slug) => Boolean(slug) && bySlug?.has(slug), [bySlug]);

  const toggle = useCallback(
    async (slug) => {
      if (!slug) return;
      // Un visiteur non connecté est renvoyé vers la connexion, puis ramené ici :
      // le favori qu'il voulait poser est le contexte, pas la page d'accueil.
      if (!user) {
        navigate(`/connexion?from=${encodeURIComponent(location.pathname + location.search)}`);
        return;
      }
      if (pending) return;

      const previous = bySlug;
      const wasFavorite = previous.has(slug);
      const next = new Map(previous);
      if (wasFavorite) next.delete(slug);
      else next.set(slug, PENDING_ID);

      // Optimiste : le cœur change tout de suite, on annule si l'appel échoue.
      setCharge(next);
      setPending(slug);
      setError('');

      try {
        if (wasFavorite) {
          await removeFavorite(previous.get(slug));
        } else {
          const res = await addFavorite(slug);
          // La création renvoie l'_id de l'artisan : on le mémorise pour
          // pouvoir retirer le favori plus tard sans relire la liste.
          const id = res?.data?.artisan;
          if (id) {
            const merged = new Map(bySlug);
            merged.set(slug, id);
            setCharge(merged);
          } else {
            // Cas de la course (favori créé entre-temps) : l'API n'a rien
            // renvoyé d'exploitable, on relit la liste.
            const fresh = await listFavorites();
            setCharge(toMap(fresh?.data));
          }
        }
      } catch (err) {
        setCharge(previous);
        setError(getErrorMessage(err));
      } finally {
        setPending(null);
      }
    },
    [user, bySlug, pending, navigate, location.pathname, location.search],
  );

  return {
    isFavorite,
    toggle,
    pending,
    ready: bySlug !== null,
    error,
    dismissError: () => setError(''),
  };
}