import { useState } from 'react'
import { Link } from 'react-router-dom'
import HeroVariantA from '../components/hero-variants/HeroVariantA'
import HeroVariantB from '../components/hero-variants/HeroVariantB'
import HeroVariantC from '../components/hero-variants/HeroVariantC'

const variants = [
  { key: 'A', label: 'A — Split', desc: 'Texte à gauche, photo à droite, WhatsApp mis en avant.' },
  { key: 'B', label: 'B — Bandeau vert', desc: 'Pleine largeur vert profond, chips métiers populaires.' },
  { key: 'C', label: 'C — Preuve d’abord', desc: 'Trois vrais artisans au-dessus de la recherche.' },
]

export default function HeroVariantsPage() {
  const [active, setActive] = useState('A')
  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface antialiased">
      <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-3 px-4 py-3 md:px-8">
          <Link to="/" className="mr-2 flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-primary">
            <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_back</span>
            Accueil
          </Link>
          <span className="text-sm font-bold">Variantes Hero :</span>
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
      {active === 'A' && <HeroVariantA />}
      {active === 'B' && <HeroVariantB />}
      {active === 'C' && <HeroVariantC />}
    </div>
  )
}
