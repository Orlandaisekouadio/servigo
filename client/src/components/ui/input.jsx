// Input — portage du composant shadcn/ui, stylé aux tokens ServiGo
// (même rendu que les champs des pages Contact / Connexion).
import * as React from 'react'

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cx(
      'flex h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-on-surface transition-colors outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  />
))
Input.displayName = 'Input'

export { Input }