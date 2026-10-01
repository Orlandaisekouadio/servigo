import { Link } from 'react-router-dom'
import { Reveal } from './motion'

const badges = [
  {
    icon: 'verified',
    label: 'Artisans vérifiés & notés',
  },
  {
    icon: 'call',
    label: 'Contact direct, sans intermédiaire',
  },
  {
    icon: 'reviews',
    label: 'Avis clients authentiques',
  },
  {
    icon: 'payments',
    label: "Paiement direct avec l'artisan",
  },
]

export default function FinalCTA() {
  return (
    <section id="partenaire" tabIndex={-1} className="relative scroll-mt-28 overflow-hidden bg-primary py-16 md:py-24">
      <div className="absolute top-0 right-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary-fixed-dim/20 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 h-80 w-80 -translate-x-1/2 translate-y-1/2 rounded-full bg-surface-tint/30 blur-3xl"></div>

      <div className="relative z-10 mx-auto px-4 text-center max-w-4xl">
        <h2 className="mb-6 text-[28px] font-bold text-on-primary md:text-[48px]">
          Mise en relation directe &amp; rapide
        </h2>
        <p className="mx-auto mb-10 w-full max-w-2xl text-[18px] leading-7 text-white">
          Vous cherchez le meilleur artisan pour vos travaux ? Parcourez notre annuaire
          d&apos;artisans vérifiés, comparez les profils et contactez l&apos;artisan de votre choix
          en toute simplicité en Côte d&apos;Ivoire.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/recherche"
            className="w-full rounded-xl bg-white px-8 py-4 font-semibold text-primary transition-all duration-200 hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] sm:w-auto"
          >
            Trouver un artisan
          </Link>
          <Link
            to="/devenir-artisan"
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-transparent px-8 py-4 font-semibold text-white transition-colors duration-200 hover:bg-white/10 sm:w-auto"
          >
            <span className="material-symbols-outlined" aria-hidden="true">handshake</span>
            Devenir artisan
          </Link>
        </div>

        <Reveal delay={0.15}>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {badges.map((b) => (
              <div
                key={b.label}
                className="flex items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-sm"
              >
                <span className="material-symbols-outlined text-2xl text-primary-fixed-dim" aria-hidden="true">
                  {b.icon}
                </span>
                <span className="text-left text-sm font-semibold text-white">{b.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}