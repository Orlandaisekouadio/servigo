// « Services populaires » de la page d'accueil.
//
// La section lisait `data/categories.js`, un doublon de la collection `Service`
// maintenance manuelle : un métier ajouté par l'admin n'apparaissait pas ici,
// et un métier retiré de la base restait proposé. Le catalogue est maintenant
// lu depuis l'API, comme les listes déroulantes de l'inscription.
//
// Le titre de la carte est le nom du service (« Plomberie sanitaire »). Le
// fichier statique affichait « Plomberie » et gardait « Plomberie sanitaire »
// dans un second champ `metier` : deux libellés pour un métier, qui finissaient
// par diverger. Un seul nom, celui de la base.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Reveal, Stagger } from './motion';
import { itemVariants } from './variants';
import { assetUrl, getErrorMessage } from '../lib/api';
import { listServices } from '../services/catalogService';

// La carte fait 3/4 : au-delà de six, le rail horizontal devient interminable et
// la section perd son rôle de aperçu.
const LIMITE = 6;

export default function Categories() {
  const [etat, setEtat] = useState({ clef: null, services: [], erreur: '' });

  useEffect(() => {
    let annule = false;
    const clef = `accueil-services-${LIMITE}`;
    listServices()
      .then((res) => {
        if (annule) return;
        setEtat({ clef, services: (res?.data ?? []).slice(0, LIMITE), erreur: '' });
      })
      .catch((err) => {
        if (annule) return;
        setEtat({ clef, services: [], erreur: getErrorMessage(err) });
      });
    return () => {
      annule = true;
    };
  }, []);

  const chargement = etat.clef === null;
  const { services, erreur } = etat;

  return (
    <section
      id="services"
      tabIndex={-1}
      className="scroll-mt-28 bg-surface-container-low py-16 md:py-24"
    >
      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
        <Reveal>
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="mb-2 text-2xl font-semibold text-on-surface">Services Populaires</h2>
              <p className="text-on-surface-variant">Trouvez le bon expert pour votre besoin</p>
            </div>
            <Link
              to="/recherche"
              className="hidden items-center gap-1 font-semibold text-primary hover:underline md:flex"
            >
              Voir tout{' '}
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                arrow_forward
              </span>
            </Link>
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
            <p className="text-lg font-bold">Services indisponibles</p>
            <p className="mt-1 text-[15px] text-slate-600">{erreur}</p>
            <Link
              to="/recherche"
              className="mt-5 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white"
            >
              Ouvrir la recherche
            </Link>
          </div>
        ) : chargement ? (
          <div className="flex gap-6 overflow-hidden pb-8">
            {Array.from({ length: LIMITE }).map((_, i) => (
              <div
                key={i}
                aria-hidden="true"
                className="aspect-[3/4] w-[280px] flex-none animate-pulse rounded-2xl bg-slate-200 md:w-[320px]"
              />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <span
              className="material-symbols-outlined mb-3 text-5xl text-slate-300"
              aria-hidden="true"
            >
              category
            </span>
            <p className="text-lg font-bold">Aucun service publié</p>
            <p className="mt-1 text-[15px] text-slate-500">
              Les métiers disponibles apparaîtront ici dès qu&apos;ils seront ajoutés au catalogue.
            </p>
          </div>
        ) : (
          <Stagger className="flex gap-6 overflow-x-auto pb-8 no-scrollbar">
            {services.map((s) => (
              <motion.div key={s._id ?? s.slug} variants={itemVariants} className="flex-none snap-start">
                <Link
                  // `metier` doit correspondre exactement au nom du service : le
                  // filtre de l'API compare Service.name.
                  to={`/recherche?metier=${encodeURIComponent(s.name)}`}
                  aria-label={`${s.name} : trouver un artisan`}
                  className="group relative block aspect-[3/4] w-[280px] overflow-hidden rounded-2xl shadow-sm transition-all duration-500 hover:shadow-xl md:w-[320px]"
                >
                  {s.imageUrl ? (
                    <img
                      src={assetUrl(s.imageUrl)}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    // Un métier sans photo reste cliquable : la carte bascule sur
                    // la teinte de marque avec l'icône Material du catalogue,
                    // plutôt que d'afficher une image cassée.
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 flex items-center justify-center bg-primary-deep"
                    >
                      <span className="material-symbols-outlined text-8xl text-white/80">
                        {s.icon || 'handyman'}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 w-full p-6">
                    <h3 className="mb-1 text-xl font-bold text-primary">{s.name}</h3>
                    {s.description ? <p className="mb-4 text-sm text-white/90">{s.description}</p> : null}
                    <div className="translate-y-4 rounded-lg bg-primary py-2 px-4 text-center font-semibold text-on-primary opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      Trouver un artisan
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </Stagger>
        )}
      </div>
    </section>
  );
}