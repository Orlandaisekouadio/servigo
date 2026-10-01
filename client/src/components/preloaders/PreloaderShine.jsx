/**
 * Loader V2 — « Éclat » : ServiGo en blanc sur vert profond, une bande de
 * lumière balaie le mot (Magic UI — animated-shiny-text, porté).
 * Le mot de base reste plein et contrasté (blanc sur #166534 ≈ 7,7:1) ;
 * seul le calque clippé porte la bande animée, figée sous reduced-motion.
 */
export default function PreloaderShine() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-64 items-center justify-center bg-primary-deep md:min-h-72"
    >
      <p
        aria-label="ServiGo"
        className="relative font-display text-6xl font-bold tracking-tight text-white"
      >
        <span aria-hidden="true" className="relative block">
          <span className="block">ServiGo</span>
          <span className="loader-shine absolute inset-0" aria-hidden="true">
            ServiGo
          </span>
        </span>
      </p>
    </div>
  )
}