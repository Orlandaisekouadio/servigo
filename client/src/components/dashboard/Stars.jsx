// Étoiles de notation — modèle du profil artisan (couleur accent).
export default function Stars({ rating, className = 'text-[#c2410c]' }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  return (
    <span
      className={`flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`Note ${rating} sur 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="material-symbols-outlined text-base" aria-hidden="true">
          {i < full || (half && i === full) ? (half && i === full ? 'star_half' : 'star') : 'star'}
        </span>
      ))}
    </span>
  )
}