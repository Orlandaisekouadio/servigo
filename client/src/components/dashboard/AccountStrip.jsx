// Bande compte compacte — en-tête d'identité commun aux espaces (démo).
// L'identité figure déjà dans la sidebar ; ici elle reste présentée en une ligne.
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

export default function AccountStrip({ name, avatar, initials, subtitle, badges, right }) {
  return (
    <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <Avatar className="h-14 w-14 shrink-0">
          <AvatarImage src={avatar} alt={`Portrait de ${name}`} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold tracking-tight text-on-surface">{name}</h2>
          <p className="truncate text-sm text-on-surface-variant">{subtitle}</p>
          {badges && (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">{badges}</div>
          )}
        </div>
      </div>
      {right && <div className="flex shrink-0 flex-wrap items-center gap-2">{right}</div>}
    </section>
  )
}