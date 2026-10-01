import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import PreloaderBlur from './preloaders/PreloaderBlur'

const FADE_MS = 320
const MAX_SHOW_MS = 2600

/**
 * Écran de démarrage du site : « ServiGo » en Vert Confiance se compose
 * (PreloaderBlur), puis l'overlay s'efface en fondu dès que l'app est prête.
 * - Jamais bloquant : masqué au plus tard après MAX_SHOW_MS, même si
 *   l'événement `load` ne se déclenche pas.
 * - prefers-reduced-motion : mot figé (PreloaderBlur) + fondu instantané
 *   (règle globale) + apparition écourtée (minShow réduit).
 */
export default function AppPreloader() {
  const reduce = useReducedMotion()
  const [fading, setFading] = useState(false)
  const [gone, setGone] = useState(false)

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
      className={`fixed inset-0 z-[80] bg-surface-container-lowest transition-opacity duration-300 ${
        fading ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      aria-hidden={fading}
    >
      <PreloaderBlur fill />
    </div>
  )
}