import { motion } from 'motion/react'
import { howItWorksImage } from '../data/images'
import { Reveal, Stagger } from './motion'
import { itemVariants } from './variants'

const steps = [
  {
    icon: 'search',
    title: 'Décrivez votre besoin',
    text: 'Métier, commune, urgence : dites en quelques mots ce qu’il vous faut.',
  },
  {
    icon: 'verified',
    title: 'Comparez les profils vérifiés',
    text: 'Photos, avis clients, zones d’intervention : choisissez l’artisan idéal.',
  },
  {
    icon: 'call',
    title: 'Contactez en direct',
    text: 'Appelez ou écrivez sur WhatsApp, sans intermédiaire ni frais cachés.',
  },
]

export default function HowItWorks() {
  return (
    <section
      id="comment"
      tabIndex={-1}
      className="scroll-mt-28 border-y border-outline-variant/30 bg-surface-container-high py-16 md:py-24"
    >
      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
        <Reveal>
          <div className="mb-16 text-center">
            <p className="mb-2 font-semibold tracking-wider text-primary-deep uppercase">
              En 3 étapes
            </p>
            <h2 className="mb-4 text-[28px] font-semibold text-on-surface md:text-[48px]">
              Comment ça marche
            </h2>
            <p className="text-on-surface-variant">
              Décrivez votre besoin, comparez les profils vérifiés, contactez en direct.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <Reveal className="relative" y={32}>
            <div className="relative z-10 aspect-[3/4] overflow-hidden rounded-[32px] border-8 border-white shadow-2xl md:aspect-square">
              <img
                src={howItWorksImage}
                alt="Maçon ServiGo sur un chantier à Abidjan"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="absolute -right-8 bottom-8 z-20 hidden w-64 rounded-2xl border border-slate-100 bg-white p-6 shadow-xl md:block [animation:bounce_5s_infinite]">
              <p className="mb-4 flex items-center gap-1.5 font-bold text-on-surface">
                <span className="material-symbols-outlined text-lg text-primary" aria-hidden="true">verified</span>
                Artisan vérifié
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img src="/images/koffi.png" alt="" className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-bold text-on-surface">Koffi A.</p>
                    <p className="text-xs text-on-surface-variant">Électricien · Cocody</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-base text-accent" aria-hidden="true">star</span>
                  <span className="text-sm font-bold text-on-surface">4,9</span>
                  <span className="text-xs text-on-surface-variant">(128 avis)</span>
                </div>
              </div>
              <div className="mt-4 rounded-full bg-primary-soft px-3 py-1.5 text-center text-xs font-bold text-primary-deep">
                Disponible maintenant
              </div>
            </div>

            <div className="absolute top-1/2 -right-4 z-30 flex -translate-y-1/2 items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white shadow-lg">
              <span>Choisir un artisan</span>
              <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
            </div>
          </Reveal>

          <Stagger className="relative space-y-12">
            <div className="absolute top-4 bottom-4 left-7 w-px bg-outline-variant/30"></div>
            {steps.map((step) => (
              <motion.div key={step.title} variants={itemVariants} className="group relative flex items-start gap-6">
                <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-[28px]" aria-hidden="true">{step.icon}</span>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-on-surface">{step.title}</h3>
                  <p className="text-on-surface-variant">{step.text}</p>
                </div>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  )
}
