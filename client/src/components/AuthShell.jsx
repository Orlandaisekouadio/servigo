import { Link } from 'react-router-dom'

export default function AuthShell({ badge, title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface antialiased">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left brand panel */}
        <div className="relative hidden overflow-hidden bg-primary-deep text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary-fixed-dim/20 blur-3xl"></div>
          <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-surface-tint/40 blur-3xl"></div>

          <div className="relative z-10 flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-2xl font-extrabold tracking-tight"
            >
              <span className="material-symbols-outlined text-[32px]" aria-hidden="true">home_repair_service</span>
              ServiGo
            </Link>
            <Link
              to="/"
              className="flex items-center gap-1 text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_back</span>
              Retour à l&apos;accueil
            </Link>
          </div>

          <div className="relative z-10 max-w-md">
            {badge && (
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">
                {badge}
              </span>
            )}
            <h1 className="mb-4 text-4xl leading-tight font-bold tracking-tight">{title}</h1>
            <p className="text-lg leading-8 text-white/85">{subtitle}</p>
          </div>

          <div className="relative z-10 flex items-center gap-8 text-xs font-medium text-white/60">
            <span>Aide & Contact</span>
            <span>Confidentialité</span>
            <span>Conditions Générales</span>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex flex-col justify-center px-6 py-12 md:px-16 lg:px-20">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-primary-deep">
              <span className="material-symbols-outlined" aria-hidden="true">home_repair_service</span>
              ServiGo
            </Link>
            <Link to="/" className="flex items-center gap-1 text-sm text-slate-500">
              <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_back</span>
              Accueil
            </Link>
          </div>

          {children}
        </div>
      </div>

      {/* Mobile footer */}
      <div className="flex items-center justify-center gap-6 pb-8 text-xs font-medium text-slate-500 lg:hidden">
        <span>Aide & Contact</span>
        <span>Confidentialité</span>
        <span>Conditions Générales</span>
      </div>
    </div>
  )
}