// Galerie en bento grid — portage de `bento-grid` (Magic UI) adapté aux photos
// de chantier : la photo remplit la case, une légende courte vit sur un dégradé
// sombre. Cliquer sur une case ouvre un lightbox (photo en grand, ombre en bas
// portant la description). La grille (col-span/row-span variants) garde la
// mécanique d'origine.
import { useEffect, useRef, useState } from 'react'

const cx = (...cls) => cls.filter(Boolean).join(' ')

export function BentoGrid({ className, children }) {
  return (
    <div
      className={cx(
        'grid w-full auto-rows-[11rem] grid-cols-2 gap-3 sm:auto-rows-[13rem] lg:auto-rows-[15rem] lg:grid-cols-4 lg:gap-4',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function BentoPhotoCard({ ref, photo, title, description, className, onSelect }) {
  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect()
    }
  }
  return (
    <figure
      ref={ref}
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-label={`Afficher en grand : ${title}`}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      className={cx(
        'group relative cursor-pointer overflow-hidden rounded-2xl bg-surface-container-low shadow-sm',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        className,
      )}
    >
      <img
        src={photo}
        alt={`${title}${description ? ` — ${description}` : ''}`}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-105"
      />
      {/* Dégradé de lisibilité (sombre sous la légende) */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
        aria-hidden="true"
      />
      {/* Pastille agrandissement (au survol / focus) */}
      <span
        className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
        aria-hidden="true"
      >
        <span className="material-symbols-outlined text-lg">zoom_in</span>
      </span>
      <figcaption className="absolute inset-x-0 bottom-0 p-4 md:p-5">
        <h3 className="text-base font-bold tracking-tight text-white md:text-lg">{title}</h3>
        {description && (
          <p className="mt-0.5 line-clamp-2 max-w-md text-sm text-white/85">{description}</p>
        )}
      </figcaption>
    </figure>
  )
}

// Lightbox : photo en grand (80vh max), ombre noire en bas portant la légende.
// Fermé par Échap, clic sur le fond ou bouton X ; flèches ←/→ pour naviguer.
// Le focus retourne à la vignette d'origine à la fermeture.
function GalleryLightbox({ item, index, total, onClose, onPrev, onNext }) {
  const closeRef = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true))
    closeRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      cancelAnimationFrame(id)
      document.body.style.overflow = previousOverflow
    }
  }, [])

  const onKeyDown = (e) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft' && !e.metaKey && !e.ctrlKey && !e.altKey) onPrev()
    if (e.key === 'ArrowRight' && !e.metaKey && !e.ctrlKey && !e.altKey) onNext()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Galerie — ${item.title}`}
      onKeyDown={onKeyDown}
      className={cx(
        'fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8',
        'transition-opacity duration-300 motion-reduce:transition-none',
        shown ? 'opacity-100' : 'opacity-0',
      )}
    >
      {/* Fond */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      {/* Photo + ombre de description */}
      <figure
        className={cx(
          'relative max-h-[88vh] transition-transform duration-300 motion-reduce:transition-none',
          shown ? 'scale-100' : 'scale-95',
        )}
      >
        <img
          src={item.photo}
          alt={`${item.title}${item.subtitle ? ` — ${item.subtitle}` : ''}`}
          className="max-h-[88vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-2xl bg-gradient-to-t from-black/90 via-black/45 to-transparent"
          aria-hidden="true"
        />
        <figcaption className="absolute inset-x-0 bottom-0 p-5 md:p-6">
          <h3 className="text-xl font-bold tracking-tight text-white md:text-2xl">{item.title}</h3>
          {item.subtitle && (
            <p className="mt-1 max-w-xl text-sm text-white/85 md:text-base">{item.subtitle}</p>
          )}
        </figcaption>
      </figure>

      {/* Compteur */}
      <span className="absolute top-4 left-4 z-10 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white md:top-6 md:left-6">
        {index + 1} / {total}
      </span>

      {/* Navigation */}
      <button
        type="button"
        onClick={onPrev}
        aria-label="Photo précédente"
        className="absolute top-1/2 left-2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 md:left-6"
      >
        <span className="material-symbols-outlined text-lg" aria-hidden="true">
          chevron_left
        </span>
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Photo suivante"
        className="absolute top-1/2 right-2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 md:right-6"
      >
        <span className="material-symbols-outlined text-lg" aria-hidden="true">
          chevron_right
        </span>
      </button>

      {/* Fermeture */}
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Fermer la galerie"
        className="absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white md:top-6 md:right-6"
      >
        <span className="material-symbols-outlined text-lg" aria-hidden="true">
          close
        </span>
      </button>
    </div>
  )
}

// Ordre et tailles des cases de la galerie.
// Sur mobile : 2 colonnes — une grande case 2×2, puis paires et pleine largeur.
const SPANS = [
  'col-span-2 row-span-2', // tableau — pièce maîtresse
  'col-span-2', // câblage — pleine largeur
  'col-span-1', // éclairage LED
  'col-span-1', // inverseur / batteries
  'col-span-2 lg:col-span-3', // dépannage — large
  'col-span-2 lg:col-span-1', // éclairage jardin
]

export default function GalleryBento({ items }) {
  const [activeIndex, setActiveIndex] = useState(null)
  const cardRefs = useRef([])

  const open = activeIndex != null
  const active = open ? items[activeIndex] : null

  const close = () => {
    const focusIndex = activeIndex
    setActiveIndex(null)
    requestAnimationFrame(() => cardRefs.current[focusIndex]?.focus())
  }
  const prev = () => setActiveIndex((i) => (i - 1 + items.length) % items.length)
  const next = () => setActiveIndex((i) => (i + 1) % items.length)

  return (
    <>
      <BentoGrid>
        {items.map((item, i) => (
          <BentoPhotoCard
            key={item.title}
            ref={(el) => {
              cardRefs.current[i] = el
            }}
            photo={item.photo}
            title={item.title}
            description={item.subtitle}
            className={SPANS[i % SPANS.length]}
            onSelect={() => setActiveIndex(i)}
          />
        ))}
      </BentoGrid>

      {open && (
        <GalleryLightbox
          item={active}
          index={activeIndex}
          total={items.length}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}
    </>
  )
}