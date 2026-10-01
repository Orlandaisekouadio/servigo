import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import TextAnimate from '../ui/text-animate'

/**
 * Loader V3 — « Assemblage » : les lettres de ServiGo se composent avec un
 * flou (TextAnimate / Magic UI, blur-in, par caractère), puis rejouent.
 * Boucle par remontage (key=round). Sous prefers-reduced-motion : mot
 * statique, aucune minuterie.
 *
 * `fill` : occupe tout l'écran (préloader du site) au lieu du format tuile.
 */
export default function PreloaderBlur({ fill = false }) {
  const reduce = useReducedMotion()
  const [round, setRound] = useState(0)

  useEffect(() => {
    if (reduce) return undefined
    const t = setInterval(() => setRound((r) => r + 1), 3400)
    return () => clearInterval(t)
  }, [reduce])

  const shell = fill
    ? 'flex min-h-svh w-full items-center justify-center bg-surface-container-lowest'
    : 'flex min-h-64 items-center justify-center bg-surface-container-lowest md:min-h-72'

  return (
    <div role="status" aria-live="polite" className={shell}>
      {reduce ? (
        <p className="font-display text-6xl font-bold tracking-tight text-primary">ServiGo</p>
      ) : (
        <TextAnimate
          key={round}
          as="p"
          className="font-display text-6xl font-bold tracking-tight text-primary"
          by="character"
          animation="blurIn"
          startOnView={false}
          delay={0.15}
          duration={0.55}
        >
          ServiGo
        </TextAnimate>
      )}
    </div>
  )
}