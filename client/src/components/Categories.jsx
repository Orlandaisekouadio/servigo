import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { categories } from '../data/categories'
import { Reveal, Stagger } from './motion'
import { itemVariants } from './variants'

export default function Categories() {
  return (
    <section id="services" tabIndex={-1} className="scroll-mt-28 bg-surface-container-low py-16 md:py-24">
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
              Voir tout <span className="material-symbols-outlined text-[20px]" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>
        </Reveal>

        <Stagger className="flex gap-6 overflow-x-auto pb-8 no-scrollbar">
          {categories.map((cat) => (
            <motion.div key={cat.id} variants={itemVariants} className="flex-none snap-start">
            <Link
              to={`/recherche?metier=${encodeURIComponent(cat.metier)}`}
              aria-label={`${cat.name} : trouver un artisan`}
              className="group relative block aspect-[3/4] w-[280px] overflow-hidden rounded-2xl shadow-sm transition-all duration-500 hover:shadow-xl md:w-[320px]"
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full p-6">
                <h3 className="mb-1 text-xl font-bold text-primary">{cat.name}</h3>
                <p className="mb-4 text-sm text-white/90">{cat.description}</p>
                <div className="translate-y-4 rounded-lg bg-primary py-2 px-4 text-center font-semibold text-on-primary opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  Trouver un artisan
                </div>
              </div>
            </Link>
            </motion.div>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
