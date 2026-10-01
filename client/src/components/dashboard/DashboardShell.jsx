// Coquille de dashboard autonome : sidebar (desktop) + tiroir (mobile) + barre
// supérieure. Aucune navbar ni footer de la vitrine : les espaces sont des
// applications de démonstration à part entière, accessibles par URL directe.
import { Children, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

export default function DashboardShell({
  spaceLabel,
  items,
  value,
  onValueChange,
  account,
  header,
  children,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const burgerRef = useRef(null)
  const active = items.find((i) => i.id === value) ?? items[0]

  // Échap ferme le tiroir (le focus revient au burger).
  useEffect(() => {
    if (!drawerOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false)
        burgerRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  // Le tiroir ne survit pas au passage mobile → desktop.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = (e) => {
      if (e.matches) setDrawerOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const initials = (name) =>
    name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')

  const renderProfileCard = () => (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-5 text-center shadow-sm">
      <Avatar className="mx-auto h-16 w-16">
        <AvatarImage src={account.avatar} alt={`Portrait de ${account.name}`} />
        <AvatarFallback>{account.initials ?? initials(account.name)}</AvatarFallback>
      </Avatar>
      <p className="mt-3 truncate text-sm font-bold text-on-surface">{account.name}</p>
      <p className="mt-0.5 truncate text-xs text-on-surface-variant">{account.meta}</p>
    </div>
  )

  const renderNav = (closeOnClick) => (
    <nav aria-label={`Navigation de l'${spaceLabel}`} className="flex flex-col gap-1">
      {items.map((item) => {
        const isActive = item.id === value
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onValueChange(item.id)
              closeOnClick?.()
            }}
            aria-current={isActive ? 'page' : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition-colors ${
              isActive
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              {item.icon}
            </span>
            <span className="truncate">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )

  const renderSidebarBottom = () => (
    <>
      <div className="border-t border-slate-200/70 pt-4">
        <Link
          to="/"
          className="flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            storefront
          </span>
          Retour à la vitrine
        </Link>
      </div>
    </>
  )

  const brand = (
    <div className="mb-8 flex items-center gap-2.5 px-2">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-on-primary"
        aria-hidden="true"
      >
        <span className="material-symbols-outlined text-[20px]">handyman</span>
      </span>
      <div>
        <p className="text-base leading-tight font-bold text-on-surface">ServiGo</p>
        <p className="text-xs font-medium text-on-surface-variant">{spaceLabel}</p>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-surface text-on-surface antialiased">
      {/* Sidebar desktop */}
      <aside className="hidden border-r border-slate-200 bg-white lg:block lg:w-72 lg:shrink-0">
        <div className="sticky top-0 flex h-screen flex-col gap-4 overflow-y-auto px-4 py-6">
          {brand}
          {renderProfileCard()}
          {renderNav()}
          <div className="mt-auto">{renderSidebarBottom()}</div>
        </div>
      </aside>

      {/* Colonne principale */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-8">
          <button
            ref={burgerRef}
            type="button"
            onClick={() => setDrawerOpen((v) => !v)}
            aria-expanded={drawerOpen}
            aria-controls="dash-drawer"
            aria-label="Ouvrir le menu"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-on-surface transition-colors hover:bg-surface-container-low lg:hidden"
          >
            <span className="material-symbols-outlined text-xl" aria-hidden="true">
              {drawerOpen ? 'close' : 'menu'}
            </span>
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-on-surface">
              {active.label}
            </h1>
            <p className="hidden truncate text-xs font-medium text-on-surface-variant sm:block">
              {spaceLabel}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src={account.avatar} alt="" />
              <AvatarFallback>{account.initials ?? initials(account.name)}</AvatarFallback>
            </Avatar>
            <Link
              to="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-base" aria-hidden="true">
                storefront
              </span>
              <span className="hidden sm:inline">Retour à la vitrine</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-[1200px]">
            {header}
            {Children.map(children, (child, index) => {
              const item = items[index]
              return (
                <section
                  key={item?.id}
                  id={`dash-panel-${item?.id}`}
                  hidden={value !== item?.id}
                  aria-label={item?.label}
                  className="focus-visible:outline-none"
                >
                  {child}
                </section>
              )
            })}
          </div>
        </main>
      </div>

      {/* Tiroir mobile (disclosure non-modale, comme le menu du site) */}
      <div id="dash-drawer" className={drawerOpen ? 'fixed inset-0 z-50 lg:hidden' : 'hidden'}>
        <div
          className="absolute inset-0 bg-slate-900/40"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
        <div className="absolute top-0 left-0 flex h-full w-72 flex-col gap-4 overflow-y-auto border-r border-slate-200 bg-white px-4 py-6 shadow-xl">
          {brand}
          {renderProfileCard()}
          {renderNav(() => setDrawerOpen(false))}
          <div className="mt-auto">{renderSidebarBottom()}</div>
        </div>
      </div>
    </div>
  )
}