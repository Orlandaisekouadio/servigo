import { useState } from 'react'
import { Link } from 'react-router-dom'
import PreloaderAurora from '../components/preloaders/PreloaderAurora'
import PreloaderShine from '../components/preloaders/PreloaderShine'
import PreloaderBlur from '../components/preloaders/PreloaderBlur'

const variants = [
  { key: 'A', label: 'A — Aurore', desc: 'ServiGo en dégradé Vert Confiance qui coule en continu (AuroraText).' },
  { key: 'B', label: 'B — Éclat', desc: 'Mot blanc sur fond vert profond, une bande de lumière balaie le texte.' },
  { key: 'C', label: 'C — Assemblage', desc: 'Les lettres de ServiGo se composent avec un flou en Vert Confiance, puis rejouent (TextAnimate).' },
]

export default function PreloaderVariantsPage() {
  const [active, setActive] = useState('A')
  const current = variants.find((v) => v.key === active)
  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface antialiased">
      <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-3 px-4 py-3 md:px-8">
          <Link to="/" className="mr-2 flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-primary">
            <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_back</span>
            Accueil
          </Link>
          <span className="text-sm font-bold">Variantes Loader :</span>
          {variants.map((v) => (
            <button
              key={v.key}
              onClick={() => setActive(v.key)}
              aria-pressed={active === v.key}
              title={v.desc}
              className={`min-h-11 rounded-full px-5 text-sm font-semibold transition-colors ${
                active === v.key ? 'bg-primary text-white' : 'border border-slate-300 text-slate-600 hover:border-primary hover:text-primary'
              }`}
            >
              {v.label}
            </button>
          ))}
          <span className="ml-auto hidden text-xs text-slate-400 md:block">
            Dites-moi laquelle garder (A, B ou C).
          </span>
        </div>
      </div>
      <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          {active === 'A' && <PreloaderAurora />}
          {active === 'B' && <PreloaderShine />}
          {active === 'C' && <PreloaderBlur />}
        </div>
        <p className="mt-4 text-sm text-slate-500">{current.desc}</p>
        <p className="mt-2 text-xs text-slate-400">
          Page de comparaison — démo, accessible depuis le pied de page du site.
        </p>
      </div>
    </div>
  )
}