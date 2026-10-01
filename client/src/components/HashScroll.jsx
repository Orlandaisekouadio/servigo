import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Scrolle vers la section ciblée par le hash (#services, #comment, #partenaire)
 * après toute navigation de route — même page, cross-route, chargement direct
 * et back/forward. Sans hash, remonte en haut de page au changement de route.
 * Compense la barre sticky via scroll-margin-top (scroll-mt-28) des sections.
 */
export default function HashScroll() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const id = hash && hash.length > 1 ? hash.slice(1) : null
    const el = id ? document.getElementById(id) : null

    if (el) {
      el.scrollIntoView({
        behavior: reducedMotion() ? 'auto' : 'smooth',
        block: 'start',
      })
      // Donne un contexte de navigation aux lecteurs d'écran (sections tabIndex=-1) ;
      // no-op sur un élément non focusable.
      el.focus({ preventScroll: true })
    } else {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: reducedMotion() ? 'auto' : 'auto',
      })
    }
  }, [pathname, hash])

  return null
}