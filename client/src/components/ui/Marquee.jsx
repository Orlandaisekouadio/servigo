// Marquee — infinie scrolling (Magic UI, porté sans dépendance `cn`).
// Keyframes dans index.css. Respecte prefers-reduced-motion (animation arrêtée).
function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

export default function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  repeat = 4,
  ...props
}) {
  return (
    <div
      {...props}
      className={cx(
        'group flex gap-(--gap) overflow-hidden p-2 [--duration:40s] [--gap:1.5rem]',
        pauseOnHover && 'marquee-pause-on-hover',
        className
      )}
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          className={cx(
            'flex shrink-0 justify-around gap-(--gap)',
            'animate-marquee',
            reverse && '[animation-direction:reverse]'
          )}
        >
          {children}
        </div>
      ))}
    </div>
  )
}