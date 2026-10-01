import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { artisans } from '../../data/artisans'
import { SearchForm, TrustRow } from './shared'
import { ease, useHeroSearch } from './hero-search'

/**
 * Variante C — « Preuve d'abord » : trois vrais artisans au-dessus
 * de la recherche. La confiance (principe n°1) ouvre la page :
 * visages, communes, notes — données réelles uniquement.
 */
export default function HeroVariantC() {
  const s = useHeroSearch()
  const top = [...artisans].sort((a, b) => b.rating - a.rating)
  return (
    <section className="relative overflow-hidden bg-surface-container-low">
      <div className="relative z-10 mx-auto max-w-[1200px] px-4 py-16 text-center md:px-8 md:py-24">
        <motion.p
          className="mb-4 text-xs font-bold tracking-wider text-primary-deep uppercase"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          Ils interviennent déjà près de chez vous
        </motion.p>
        <motion.h1
          className="mx-auto mb-10 max-w-3xl text-4xl leading-tight font-extrabold tracking-tight text-on-surface md:text-[52px]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease }}
        >
          Des artisans <span className="text-primary">vérifiés</span>, pas des promesses
        </motion.h1>

        <motion.div
          className="mx-auto mb-10 grid max-w-4xl grid-cols-1 gap-4 text-left sm:grid-cols-3"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16, ease }}
        >
          {top.map((a) => (
            <Link
              key={a.id}
              to="/recherche"
              className="group flex items-center gap-3.5 rounded-2xl border border-outline-variant/20 bg-white p-4 shadow-raised transition-all hover:-translate-y-0.5 hover:shadow-floating"
            >
              <img
                src={a.avatar}
                alt={a.name}
                className="h-14 w-14 shrink-0 rounded-full border-2 border-white object-cover shadow"
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 font-bold text-on-surface">
                  <span className="truncate">{a.name}</span>
                  <span className="material-symbols-outlined shrink-0 text-base text-primary" role="img" aria-label="Vérifié">verified</span>
                </span>
                <span className="block truncate text-[13px] text-on-surface-variant">{a.role} · {a.location}</span>
                <span className="mt-0.5 flex items-center gap-1 text-[13px]">
                  <span className="material-symbols-outlined text-sm text-accent" aria-hidden="true">star</span>
                  <span className="font-bold text-on-surface">{a.rating.toFixed(1).replace('.', ',')}</span>
                  <span className="text-slate-500">({a.reviews} avis)</span>
                  <span className="sr-only">Note {a.rating} sur 5</span>
                </span>
              </span>
            </Link>
          ))}
        </motion.div>

        <motion.div
          className="mx-auto max-w-3xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24, ease }}
        >
          <SearchForm {...s} />
        </motion.div>
        <div className="mt-6 flex justify-center">
          <TrustRow
            items={[
              { icon: 'check_circle', label: 'Vérifiés' },
              { icon: 'star', label: 'Notés par la communauté' },
              { icon: 'chat', label: 'WhatsApp direct' },
            ]}
          />
        </div>
      </div>
    </section>
  )
}
