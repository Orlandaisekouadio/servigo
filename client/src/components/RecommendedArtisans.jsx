import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { artisans } from '../data/artisans'
import ArtisanCard from './ArtisanCard'
import { Reveal, Stagger } from './motion'
import { itemVariants } from './variants'

const rankStyles = [
  'bg-primary-deep text-white',
  'bg-primary text-white',
  'bg-outline text-white',
]

export default function RecommendedArtisans() {
  const best = [...artisans].sort((a, b) => b.rating - a.rating)

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

        <Stagger className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {best.map((artisan, i) => (
            <motion.div key={artisan.id} variants={itemVariants} className="relative pt-4">
              <span
                className={`absolute top-0 left-6 z-10 rounded-full px-3.5 py-1.5 text-xs font-bold shadow ${rankStyles[i] ?? rankStyles[2]}`}
              >
                N°{i + 1} · {artisan.rating.toFixed(1).replace('.', ',')}
              </span>
              <ArtisanCard artisan={artisan} />
            </motion.div>
          ))}
        </Stagger>

        <Reveal delay={0.1}>
          <div className="mt-10 text-center">
            <Link
              to="/recherche"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-primary px-7 font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
            >
              Voir tous les artisans
              <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
