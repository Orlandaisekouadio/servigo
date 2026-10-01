import { motion } from 'motion/react'
import { heroImage } from '../../data/categories'
import { SearchForm, TrustRow } from './shared'
import { ease, useHeroSearch } from './hero-search'

/**
 * Variante A — « Split » : texte à gauche, photo à droite.
 * Le classique des marketplaces, ancré Abidjan : communes citées,
 * canaux réels (appel + WhatsApp), zéro chiffre inventé.
 */
export default function HeroVariantA() {
  const s = useHeroSearch()
  return (
    <section className="relative overflow-hidden bg-surface">
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" aria-hidden="true"></div>
      <div className="relative z-10 mx-auto grid max-w-[1200px] items-center gap-12 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-2">
        <div>
          <motion.p
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-1.5 text-xs font-bold tracking-wider text-primary-deep uppercase"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">verified</span>
            Artisans vérifiés à Abidjan
          </motion.p>
          <motion.h1
            className="mb-5 text-4xl leading-tight font-extrabold tracking-tight text-on-surface md:text-[52px]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease }}
          >
            Un bon artisan, <span className="text-primary">à deux pas</span> de chez vous
          </motion.h1>
          <motion.p
            className="mb-8 max-w-[540px] text-[17px] leading-8 text-on-surface-variant"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease }}
          >
            Plombiers à Cocody, électriciens à Marcory, menuisiers à Yopougon : comparez les
            profils vérifiés et contactez en direct, par appel ou WhatsApp.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease }}
          >
            <SearchForm {...s} />
          </motion.div>
          <div className="mt-6">
            <TrustRow
              items={[
                { icon: 'check_circle', label: 'Identité contrôlée' },
                { icon: 'star', label: 'Avis clients vérifiés' },
                { icon: 'call', label: 'Contact direct' },
              ]}
            />
          </div>
        </div>

        <motion.div
          className="relative mx-auto w-full max-w-[520px]"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease }}
        >
          <div className="aspect-[4/5] overflow-hidden rounded-[32px] border-8 border-white shadow-2xl">
            <img src={heroImage} alt="Plombier ServiGo en intervention à Abidjan" className="h-full w-full object-cover" />
          </div>
          <div className="absolute -bottom-5 left-6 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-whatsapp/10 text-whatsapp">
              <span className="material-symbols-outlined" aria-hidden="true">chat</span>
            </span>
            <span>
              <span className="block font-bold text-on-surface">WhatsApp direct</span>
              <span className="block text-xs text-on-surface-variant">Sans intermédiaire</span>
            </span>
          </div>
          <div className="absolute -top-4 right-6 flex items-center gap-2 rounded-full bg-primary-deep px-4 py-2 text-sm font-bold text-white shadow-lg">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white"></span>
            </span>
            Disponibles près de vous
          </div>
        </motion.div>
      </div>
    </section>
  )
}
