import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import TextAnimate from './ui/text-animate'

const FADE_MS = 320
const MAX_SHOW_MS = 2600

/**
 * Écran de démarrage du site : « ServiGo » en Vert Confiance se compose lettre
 * par lettre, puis l'overlay s'efface en fondu dès que l'app est prête.
 *
 * - Jamais bloquant : masqué au plus tard après MAX_SHOW_MS, même si
 *   l'événement `load` ne se déclenche pas.
 * - prefers-reduced-motion : mot figé + fondu instantané (règle globale).
 *
 * Le logotype est ici en `text-primary` et en plus grand que dans l'en-tête :
 * c'est le plein écran de démarrage, pas la navigation. La marque elle-même —
 * famille, graisse, casse, teinte — reste celle du composant `Logo`.
 */
export default function AppPreloader() {
  const reduce = useReducedMotion()
  const [fading, setFading] = useState(false)
  const [gone, setGone] = useState(false)
  // Relance la composition des lettres tant que l'écran est visible.
  const [round, setRound] = useState(0)

  useEffect(() => {
    if (reduce) return undefined
    const t = setInterval(() => setRound((r) => r + 1), 3400)
    return () => clearInterval(t)
  }, [reduce])

  useEffect(() => {
    let done = false
    const hide = () => {
      if (done) return
      done = true
      window.removeEventListener('load', hide)
      setFading(true)
      window.setTimeout(() => setGone(true), FADE_MS)
    }
    const minShow = reduce ? 250 : 750
    const minTimer = window.setTimeout(hide, minShow)
    const maxTimer = window.setTimeout(hide, MAX_SHOW_MS)
    window.addEventListener('load', hide, { once: true })
    return () => {
      window.clearTimeout(minTimer)
      window.clearTimeout(maxTimer)
      window.removeEventListener('load', hide)
    }
  }, [reduce])

  if (gone) return null
  return (
    <div
      className={`fixed inset-0 z-[80] flex min-h-svh items-center justify-center bg-surface-container-lowest transition-opacity duration-300 ${
        fading ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      role="status"
      aria-live="polite"
      aria-hidden={fading}
    >
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
