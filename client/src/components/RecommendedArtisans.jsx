// « Les mieux notés » de la page d'accueil.
//
// La section lisait `data/artisans.js`, un fichier de données inventées
// (Kouassi Jean, 124 avis, note 5,0) sans aucun artisan correspondant. Elle
// interroge maintenant le catalogue : les cartes affichées sont des artisans
// réels, et l'ordre de tri est celui de l'API.
//
// Le tri se fait côté serveur (`?sort=rating`) plutôt qu'en JavaScript sur une
// page déjà triée : c'est la même clé de tri que celle de la recherche, donc les
// deux écrans ne peuvent pas diverger.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import ArtisanCard from './ArtisanCard';
import { Reveal, Stagger } from './motion';
import { itemVariants } from './variants';
import { getErrorMessage } from '../lib/api';
import { noteFr } from '../lib/format';
import { listArtisans } from '../services/artisanService';

// Trois artisans comme sur la grille à trois colonnes de la section.
const LIMITE = 3;

// Pastilles du podium. La dernière sert au-delà de trois artisans si le nombre
// change, d'où lindex de repli.
const RANG_STYLES = [
  'bg-primary-deep text-white',
  'bg-primary text-white',
  'bg-outline text-white',
];

export default function RecommendedArtisans() {
  const [etat, setEtat] = useState({ clef: null, artisans: [], erreur: '' });

  useEffect(() => {
    let annule = false;
    const clef = `accueil-mieux-notes-${LIMITE}`;
    listArtisans({ sort: 'rating', limit: LIMITE })
      .then((res) => {
        if (annule) return;
        setEtat({ clef, artisans: res?.data ?? [], erreur: '' });
      })
      .catch((err) => {
        if (annule) return;
        setEtat({ clef, artisans: [], erreur: getErrorMessage(err) });
      });
    return () => {
      annule = true;
    };
  }, []);

  const chargement = etat.clef === null;
  const { artisans, erreur } = etat;

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
        <Reveal>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-2 text-xs font-bold tracking-wider text-primary-deep uppercase">
              Top artisans
            </p>
            <h2 className="mb-4 text-2xl font-semibold text-on-surface">
              Les mieux notés à Abidjan
            </h2>
            <p className="text-on-surface-variant">
              Classés par note moyenne et avis clients vérifiés. La preuve avant la promesse.
            </p>
          </div>
        </Reveal>

        {erreur ? (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
            <span
              className="material-symbols-outlined mb-3 text-5xl text-red-400"
              aria-hidden="true"
            >
              cloud_off
            </span>
            <p className="text-lg font-bold">Classement indisponible</p>
            <p className="mt-1 text-[15px] text-slate-600">{erreur}</p>
          </div>
        ) : chargement ? (
          // Squelette à la forme exacte de la carte : la grille ne bouge pas
          // quand les données arrivent.
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: LIMITE }).map((_, i) => (
              <div
                key={i}
                aria-hidden="true"
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="h-64 w-full animate-pulse bg-slate-200" />
                <div className="space-y-3 p-7">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : artisans.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <span
              className="material-symbols-outlined mb-3 text-5xl text-slate-300"
              aria-hidden="true"
            >
              store
            </span>
            <p className="text-lg font-bold">Aucun artisan à classer pour l&apos;instant</p>
            <p className="mt-1 text-[15px] text-slate-500">
              Le classement apparaîtra dès qu&apos;un artisan aura une fiche publiée.
            </p>
          </div>
        ) : (
          <Stagger className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {artisans.map((a, i) => (
              <motion.div key={a._id ?? a.slug} variants={itemVariants} className="h-full">
                <ArtisanCard
                  artisan={a}
                  rank={{
                    label: `N°${i + 1} · ${noteFr(a.rating)}`,
                    className: RANG_STYLES[i] ?? RANG_STYLES[RANG_STYLES.length - 1],
                  }}
                />
              </motion.div>
            ))}
          </Stagger>
        )}

        <Reveal delay={0.1}>
          <div className="mt-10 text-center">
            <Link
              to="/recherche"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-primary px-7 font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
            >
              Voir tous les artisans
              <span className="material-symbols-outlined" aria-hidden="true">
                arrow_forward
              </span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}