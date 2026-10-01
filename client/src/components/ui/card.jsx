// Card — portage du composant shadcn/ui, stylé aux tokens ServiGo
// (cartes du site : coins arrondis 2xl, bordure slate claire, ombre douce).
import * as React from 'react'

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cx('rounded-2xl border border-slate-200 bg-white shadow-sm', className)}
    {...props}
  />
))
Card.displayName = 'Card'

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cx('flex flex-col gap-1.5 p-5 md:p-6 md:pb-4', className)} {...props} />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cx('font-bold tracking-tight text-on-surface', className)} {...props} />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cx('text-sm text-on-surface-variant', className)} {...props} />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cx('p-5 pt-0 md:p-6 md:pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cx('flex items-center p-5 pt-0 md:p-6 md:pt-0', className)} {...props} />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }