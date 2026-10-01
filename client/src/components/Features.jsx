import { motion } from 'motion/react'
import { Stagger } from './motion'
import { itemVariants } from './variants'

const features = [
  {
    icon: 'verified_user',
    title: 'Artisans Vérifiés',
    text: "Nous vérifions l'identité et les qualifications de chaque professionnel pour votre sécurité.",
  },
  {
    icon: 'speed',
    title: 'Service Rapide',
    text: 'Trouvez des artisans disponibles immédiatement près de chez vous pour les urgences.',
  },
  {
    icon: 'thumb_up',
    title: 'Avis Authentiques',
    text: 'Fiez-vous aux avis authentiques de la communauté pour faire le meilleur choix.',
  },
]

export default function Features() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
        <Stagger className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-raised"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container">
                <span className="material-symbols-outlined text-[28px]" aria-hidden="true">{feature.icon}</span>
              </div>
              <h3 className="mb-3 text-[20px] font-semibold text-on-surface">{feature.title}</h3>
              <p className="text-on-surface-variant">{feature.text}</p>
            </motion.div>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
