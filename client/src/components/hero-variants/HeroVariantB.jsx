import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { SearchForm, TrustRow } from './shared'
import { ease, useHeroSearch } from './hero-search'

const quickLinks = [
  { label: 'Plomberie', to: '/recherche?metier=Plomberie%20sanitaire' },
  { label: 'Électricité', to: '/recherche?metier=%C3%89lectricit%C3%A9%20%26%20C%C3%A2blage' },
  { label: 'Climatisation', to: '/recherche?metier=Climatisation%20%26%20Froid' },
  { label: 'Menuiserie', to: '/recherche?metier=Menuiserie%20%26%20Bois' },
]

/**
 * Variante B — « Bandeau vert » : pleine largeur vert profond,
 * titre blanc massif, recherche en carte blanche qui déborde,
 * raccourcis métiers en chips. La plus audacieuse des trois.
 */
export default function HeroVariantB() {
  const s = useHeroSearch()
  return (
    <section className="relative overflow-hidden bg-primary-deep text-white">
      <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-primary-fixed-dim/20 blur-3xl" aria-hidden="true"></div>
      <div className="absolute -bottom-40 -left-20 h-[28rem] w-[28rem] rounded-full bg-black/20 blur-3xl" aria-hidden="true"></div>
      <div className="relative z-10 mx-auto max-w-[1200px] px-4 pt-16 pb-24 text-center md:px-8 md:pt-24 md:pb-32">
        <motion.p
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-wider uppercase"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">location_on</span>
          Cocody · Marcory · Yopougon · Plateau
        </motion.p>
        <motion.h1
          className="mx-auto mb-5 max-w-4xl text-4xl leading-tight font-extrabold tracking-tight md:text-[64px]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease }}
        >
          L&apos;artisan qu&apos;il vous faut, <span className="text-primary-fixed-dim">déjà à Abidjan</span>
        </motion.h1>
        <motion.p
          className="mx-auto mb-8 max-w-2xl text-[17px] leading-8 text-white/85"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16, ease }}
        >
          Profils vérifiés, avis clients authentiques, appel ou WhatsApp en direct.
          Sans intermédiaire, sans frais cachés.
        </motion.p>
        <motion.div
          className="mx-auto max-w-3xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24, ease }}
        >
          <SearchForm {...s} />
        </motion.div>
        <motion.div
          className="mt-6 flex flex-wrap items-center justify-center gap-2.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.36 }}
        >
          <span className="text-sm text-white/70">Populaire :</span>
          {quickLinks.map((q) => (
            <Link
              key={q.label}
              to={q.to}
              className="min-h-11 rounded-full border border-white/30 px-5 py-2 text-sm font-semibold transition-colors hover:bg-white hover:text-primary-deep"
            >
              {q.label}
            </Link>
          ))}
        </motion.div>
        <div className="mt-8 flex justify-center">
          <TrustRow
            dark
            items={[
              { icon: 'verified', label: 'Artisans vérifiés' },
              { icon: 'payments', label: 'Devis avant travaux' },
              { icon: 'forum', label: 'Réponse rapide' },
            ]}
          />
        </div>
      </div>
    </section>
  )
}
