// Bannière d'honnêteté « démo » — même modèle que la bannière du profil artisan.
export default function DemoBanner({ children }) {
  return (
    <section
      role="note"
      aria-label="Note de démonstration"
      className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900"
    >
      <span className="material-symbols-outlined mt-0.5 text-lg" aria-hidden="true">
        info
      </span>
      <p className="text-sm leading-6">{children}</p>
    </section>
  )
}