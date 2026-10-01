import AuroraText from '../ui/aurora-text'

// Dégradé « La Cour de Confiance » (même palette que la hero)
const auroraColors = ['#166534', '#15803d', '#62df7d', '#f97316']

/**
 * Loader V1 — « Aurore » : ServiGo en dégradé Vert Confiance qui coule
 * en continu (AuroraText / Magic UI). Un seul moment, figé sous
 * prefers-reduced-motion (le dégradé reste, l'animation s'arrête).
 */
export default function PreloaderAurora() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-64 items-center justify-center bg-surface-container-low md:min-h-72"
    >
      <p className="font-display text-6xl font-bold tracking-tight">
        <AuroraText colors={auroraColors}>ServiGo</AuroraText>
      </p>
    </div>
  )
}