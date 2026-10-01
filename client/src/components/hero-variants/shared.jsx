import { motion } from 'motion/react'

export function SearchForm({ service, setService, lieu, setLieu, submit, tone = 'light' }) {
  const panel = tone === 'light' ? 'border-outline-variant/30 bg-white' : 'border-white/20 bg-white'
  return (
    <form
      onSubmit={submit}
      role="search"
      aria-label="Rechercher un artisan"
      className={`flex w-full flex-col gap-3 rounded-3xl border p-3 shadow-xl md:flex-row md:p-4 ${panel}`}
    >
      <div className="relative flex-1">
        <span className="material-symbols-outlined absolute top-1/2 left-5 -translate-y-1/2 text-[26px] text-outline" aria-hidden="true">
          search
        </span>
        <input
          type="search"
          value={service}
          onChange={(e) => setService(e.target.value)}
          aria-label="Quel service recherchez-vous ?"
          placeholder="Quel service recherchez-vous ?"
          className="h-14 w-full bg-transparent pl-14 pr-4 text-[15px] text-on-surface placeholder:text-outline md:text-base"
        />
      </div>
      <div className="my-3 hidden w-px bg-outline-variant/50 md:block"></div>
      <div className="relative flex-1">
        <span className="material-symbols-outlined absolute top-1/2 left-5 -translate-y-1/2 text-[26px] text-outline" aria-hidden="true">
          location_on
        </span>
        <input
          type="text"
          value={lieu}
          onChange={(e) => setLieu(e.target.value)}
          aria-label="Dans quelle commune ?"
          placeholder="Abidjan, Cocody..."
          className="h-14 w-full bg-transparent pl-14 pr-4 text-[15px] text-on-surface placeholder:text-outline md:text-base"
        />
      </div>
      <button type="submit" className="flex h-14 min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-12 text-base font-semibold text-white transition-all hover:bg-primary-deep md:w-auto">
        Rechercher
      </button>
    </form>
  )
}

export function TrustRow({ items, dark = false }) {
  return (
    <motion.div
      className={`flex flex-wrap gap-x-6 gap-y-2 text-sm ${dark ? 'text-white/85' : 'text-on-surface-variant'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.45 }}
    >
      {items.map((t) => (
        <span key={t.label} className="flex items-center gap-2">
          <span className={`material-symbols-outlined text-[20px] ${dark ? 'text-primary-fixed-dim' : 'text-primary'}`} aria-hidden="true">
            {t.icon}
          </span>
          {t.label}
        </span>
      ))}
    </motion.div>
  )
}
