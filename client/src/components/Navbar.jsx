import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useSession } from '../session/useSession'

const navLinks = [
  { to: '/#services', hash: '#services', label: 'Services' },
  { to: '/#comment', hash: '#comment', label: 'Comment ça marche' },
  { to: '/#avis', hash: '#avis', label: 'Avis clients' },
  { to: '/devenir-artisan', label: 'Devenir artisan' },
]

// Entrées du menu de compte : elles pointent vers l'espace client via `?section=`,
// ce qui sélectionne la bonne section à l'arrivée (cf. ClientDashboardPage).
const userMenuLinks = [
  { to: '/espace-client', label: 'Mon espace client', icon: 'space_dashboard' },
  { to: '/espace-client?section=favoris', label: 'Artisans favoris', icon: 'favorite' },
  { to: '/espace-client?section=historique', label: 'Historique des contacts', icon: 'history' },
]

const MOBILE_MENU_ID = 'navbar-mobile-menu'
const USER_MENU_ID = 'navbar-user-menu'

export default function Navbar() {
  const { user, signOut } = useSession()
  const [open, setOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navRef = useRef(null)
  const toggleRef = useRef(null)
  const userMenuRef = useRef(null)
  const userToggleRef = useRef(null)
  const location = useLocation()

  // Ferme les deux panneaux au changement de route (ils ne doivent jamais survivre à
  // la navigation). La clé inclut la query string : les entrées du menu de compte
  // naviguent vers /espace-client?section=…
  // Pattern React « storing information from previous renders » : ajustement d'état pendant le rendu.
  const routeKey = `${location.pathname}${location.search}`
  const [prevRouteKey, setPrevRouteKey] = useState(routeKey)
  if (prevRouteKey !== routeKey) {
    setPrevRouteKey(routeKey)
    setOpen(false)
    setUserMenuOpen(false)
  }

  // Ferme le menu quand on franchit le breakpoint desktop (xl = 1280px) ;
  // l'état open ne doit pas survivre au passage mobile → desktop → mobile.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1280px)')
    const onChange = (e) => {
      if (e.matches) setOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Escape ferme (et rend le focus au toggle) ; un tap/clic extérieur au panneau ferme aussi.
  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    const onPointerDown = (e) => {
      if (!navRef.current?.contains(e.target)) setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  // Même contrat de disclosure pour le menu de compte, avec son propre toggle.
  useEffect(() => {
    if (!userMenuOpen) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false)
        userToggleRef.current?.focus()
      }
    }
    const onPointerDown = (e) => {
      if (!userMenuRef.current?.contains(e.target)) setUserMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [userMenuOpen])

  const handleSignOut = () => {
    signOut()
    setUserMenuOpen(false)
    setOpen(false)
  }

  const closeAll = () => {
    setOpen(false)
    setUserMenuOpen(false)
  }

  return (
    <nav
      ref={navRef}
      aria-label="Navigation principale"
      className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/95 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-3 px-4 md:px-8 xl:h-20 xl:gap-10">
        <Link
          to="/"
          className="flex items-center gap-1.5 py-2 font-display text-xl font-extrabold tracking-tight text-primary xl:text-2xl"
        >
          <span className="material-symbols-outlined text-[20px] xl:text-2xl" aria-hidden="true">
            verified
          </span>
          ServiGo
        </Link>

        <div className="hidden items-center text-sm font-semibold xl:flex xl:space-x-6">
          {navLinks.map((l) => {
            const isActive = l.hash
              ? location.pathname === '/' && location.hash === l.hash
              : location.pathname === l.to
            return (
              <Link
                key={l.label}
                to={l.to}
                onClick={closeAll}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center py-3 whitespace-nowrap transition-[color] duration-200 hover:text-primary ${
                  isActive ? 'border-b-2 border-primary text-primary' : 'text-slate-600'
                }`}
              >
                {l.label}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 xl:gap-3">
          <Link
            to="/recherche"
            className="flex items-center rounded-full bg-primary px-5 py-3 text-sm font-semibold whitespace-nowrap text-on-primary transition-[background-color,box-shadow,transform] duration-200 hover:bg-primary-deep hover:shadow-floating active:scale-95 max-[420px]:hidden xl:px-7 xl:text-sm"
          >
            Trouver un artisan
          </Link>
          {/* Connecté : avatar + menu de compte, toujours visible, après le CTA. */}
          {user ? (
            <>
              <div ref={userMenuRef} className="relative">
              <button
                ref={userToggleRef}
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-expanded={userMenuOpen}
                aria-controls={USER_MENU_ID}
                aria-haspopup="true"
                aria-label={userMenuOpen ? 'Fermer le menu de compte' : `Ouvrir le menu de compte de ${user.name}`}
                className="flex min-h-11 items-center gap-2 rounded-full py-1.5 pr-3 pl-1.5 text-sm font-semibold whitespace-nowrap text-slate-700 transition-colors hover:bg-primary-soft"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt="" />
                  <AvatarFallback>{user.initials}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">{user.name}</span>
                <span className="material-symbols-outlined text-lg" aria-hidden="true">
                  {userMenuOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {userMenuOpen && (
                <div
                  id={USER_MENU_ID}
                  className="absolute top-full right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200/50 bg-white shadow-floating"
                >
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="truncate text-sm font-bold text-on-surface">{user.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      Client · {user.location}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 p-2">
                    {userMenuLinks.map((l) => (
                      <Link
                        key={l.label}
                        to={l.to}
                        onClick={closeAll}
                        className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-primary-soft hover:text-primary-deep"
                      >
                        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                          {l.icon}
                        </span>
                        {l.label}
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-primary-soft hover:text-primary-deep"
                    >
                      <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                        logout
                      </span>
                      Déconnexion
                    </button>
                  </div>

                  {/* Rappel d'honnêteté : la session est simulée, aucun compte n'existe. */}
                  <p className="flex items-start gap-1.5 border-t border-slate-100 px-4 py-2.5 text-xs leading-5 text-slate-500">
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">
                      info
                    </span>
                    {user.sessionNotice}
                  </p>
                </div>
              )}
              </div>
            </>
          ) : (
            <Link
              to="/connexion"
              className="flex min-h-11 items-center py-3 text-sm font-medium whitespace-nowrap text-slate-600 transition-[color] duration-200 hover:text-primary"
            >
              Connexion
            </Link>
          )}

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={open}
            aria-controls={MOBILE_MENU_ID}
            className="flex h-12 w-12 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 xl:hidden"
          >
            <span className="material-symbols-outlined" aria-hidden="true">{open ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {open && (
        <div
          id={MOBILE_MENU_ID}
          className="absolute inset-x-4 top-full mt-2 rounded-2xl border border-slate-200/50 bg-white p-5 shadow-floating md:inset-x-8 xl:hidden"
        >
          <div className="flex flex-col gap-1">
            {navLinks.map((l) => {
              const isActive = l.hash
                ? location.pathname === '/' && location.hash === l.hash
                : location.pathname === l.to
              return (
                <Link
                  key={l.label}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-primary-soft hover:text-primary-deep ${
                    isActive
                      ? 'bg-primary-soft font-semibold text-primary-deep'
                      : 'text-slate-700'
                  }`}
                >
                  {l.label}
                </Link>
              )
            })}

            <Link
              to="/recherche"
              onClick={() => setOpen(false)}
              className="hidden items-center justify-center rounded-lg bg-primary px-3 py-3 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-deep max-[420px]:flex"
            >
              Trouver un artisan
            </Link>

            {user ? (
              <>
                <div className="mt-2 border-t border-slate-100 px-3 pt-3">
                  <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                    Connecté (démo)
                  </p>
                  <p className="mt-1 text-sm font-bold text-on-surface">{user.name}</p>
                  <p className="text-xs text-slate-500">
                    Client · {user.location}
                  </p>
                </div>
                {userMenuLinks.map((l) => (
                  <Link
                    key={l.label}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-primary-soft hover:text-primary-deep"
                  >
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                      {l.icon}
                    </span>
                    {l.label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-primary-soft hover:text-primary-deep"
                >
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                    logout
                  </span>
                  Déconnexion
                </button>
                <p className="flex items-start gap-1.5 px-3 pt-1 text-xs leading-5 text-slate-500">
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">
                    info
                  </span>
                  {user.sessionNotice}
                </p>
              </>
            ) : (
              <Link
                to="/connexion"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-primary-soft hover:text-primary-deep"
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
