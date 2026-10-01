// Badge — portage du composant shadcn/ui sans dépendance `cva`
// (variants en table), stylé aux tokens ServiGo.
function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

const badgeVariants = {
  default: 'border-transparent bg-primary text-on-primary',
  soft: 'border-transparent bg-primary-soft text-primary-deep',
  amber: 'border-transparent bg-amber-100 text-amber-800',
  destructive: 'border-transparent bg-red-100 text-red-700',
  neutral: 'border-outline-variant bg-white text-on-surface-variant',
}

function Badge({ className, variant = 'default', ...props }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }