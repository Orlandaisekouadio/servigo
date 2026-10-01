import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { heroImage } from '../data/categories'
import { matchCommune } from '../data/search'
import TextAnimate from './ui/text-animate'
import AuroraText from './ui/aurora-text'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
}

// Dégradé aurora dans la palette « La Cour de Confiance »
const auroraColors = ['#166534', '#15803d', '#62df7d', '#f97316']

export default function Hero() {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const [service, setService] = useState('')
  const [lieu, setLieu] = useState('')

  const submitSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    let q = service.trim()
    const commune = matchCommune(lieu)
    if (commune) {
      params.set('commune', commune)
    } else if (lieu.trim()) {
      q = `${q} ${lieu.trim()}`.trim()
    }
    if (q) params.set('q', q)
    navigate(`/recherche${params.toString() ? `?${params.toString()}` : ''}`)
  }
  return (
    <section className="relative flex min-h-svh flex-col justify-center overflow-hidden bg-surface-container-low">
      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4 py-12 md:px-8 md:py-16">
        <div className="flex flex-col items-center space-y-7 text-center md:space-y-10">
          <motion.div className="max-w-3xl space-y-4" {...fadeUp}>
            <h1 className="text-4xl leading-tight font-bold tracking-tight text-on-surface md:text-[56px]">
              {reduce ? (
                <>
                  <span className="whitespace-pre">Trouvez un </span>
                  <AuroraText colors={auroraColors}>artisan vérifié</AuroraText>{' '}
                  <span>près de vous</span>
                </>
              ) : (
                <>
                  <TextAnimate as="span" by="word" animation="blurIn" once>
                    Trouvez un
                  </TextAnimate>{' '}
                  <motion.span
                    className="inline-block"
                    initial={{ opacity: 0, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 0.3, delay: 0.08 }}
                  >
                    <AuroraText colors={auroraColors}>artisan vérifié</AuroraText>
                  </motion.span>{' '}
                  <TextAnimate as="span" by="word" animation="blurIn" delay={0.12} once>
                    près de vous
                  </TextAnimate>
                </>
              )}
            </h1>
            <p className="mx-auto w-full max-w-3xl text-[17px] leading-7 text-on-surface-variant md:text-[18px]">
              Plombiers, électriciens, menuisiers et plus encore. Des professionnels qualifiés en
              Côte d&apos;Ivoire, prêts à intervenir pour tous vos besoins.
            </p>
          </motion.div>

          <motion.div
            className="relative w-full max-w-[320px] md:max-w-[576px]"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="aspect-[16/9] overflow-hidden rounded-[32px] border-8 border-white shadow-2xl">
              <img
                src={heroImage}
                alt="Plombier ServiGo en intervention à Abidjan"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="absolute -top-5 -right-4 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl [animation:bounce_3s_infinite] md:-right-6 md:p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary md:h-10 md:w-10">
                <span className="material-symbols-outlined" aria-hidden="true">verified_user</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-on-surface">Vérifiés</p>
                <p className="text-xs text-on-surface-variant">Artisans à Abidjan</p>
              </div>
            </div>

            <div className="absolute top-1/4 -left-6 hidden rounded-xl border border-slate-100 bg-white p-2.5 shadow-lg [animation:ping_4s_ease-in-out_infinite] sm:block md:-left-8 md:p-3">
              <span className="material-symbols-outlined text-primary" aria-hidden="true">plumbing</span>
            </div>
            <div className="absolute -right-6 bottom-1/4 hidden rounded-xl border border-slate-100 bg-white p-2.5 shadow-lg [animation:ping_5s_ease-in-out_infinite] sm:block md:-right-8 md:p-3">
              <span className="material-symbols-outlined text-primary" aria-hidden="true">bolt</span>
            </div>
          </motion.div>

          <motion.form
            onSubmit={submitSearch}
            role="search"
            aria-label="Rechercher un artisan"
            className="w-full max-w-3xl flex flex-col gap-3 rounded-3xl border border-outline-variant/30 bg-white p-3 shadow-xl md:flex-row md:gap-3 md:p-4"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute top-1/2 left-5 -translate-y-1/2 text-[26px] text-outline" aria-hidden="true">
                search
              </span>
              <input
                type="search"
                value={service}
                onChange={(e) => setService(e.target.value)}
                aria-label="Quel service recherchez-vous ?"
                placeholder="Quel service recherchez-vous ?"
                className="h-14 w-full bg-transparent pl-14 pr-4 text-[15px] text-on-surface placeholder:text-outline focus:ring-0 md:text-base"
              />
            </div>
            <div className="my-3 hidden w-px bg-outline-variant/50 md:block"></div>
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute top-1/2 left-5 -translate-y-1/2 text-[26px] text-outline" aria-hidden="true">
                location_on
              </span>
              <input
                type="text"
                value={lieu}
                onChange={(e) => setLieu(e.target.value)}
                aria-label="Dans quelle commune ?"
                placeholder="Abidjan, Cocody..."
                className="h-14 w-full bg-transparent pl-14 pr-4 text-[15px] text-on-surface placeholder:text-outline focus:ring-0 md:text-base"
              />
            </div>
            <button type="submit" className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-12 text-base font-semibold text-on-primary transition-all hover:opacity-90 md:w-auto">
              Rechercher
            </button>
          </motion.form>

          <motion.div
            className="flex flex-wrap justify-center gap-6 text-sm text-on-surface-variant"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary" aria-hidden="true">check_circle</span>
              Vérifiés
            </span>
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary" aria-hidden="true">star</span>
              Notés par la communauté
            </span>
          </motion.div>
        </div>
      </div>

      <div className="absolute top-0 left-1/2 -z-10 h-full w-full -translate-x-1/2">
        <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl"></div>
      </div>
    </section>
  )
}
