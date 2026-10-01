// Label — portage du composant shadcn/ui (Radix), stylé aux tokens ServiGo.
import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cx('text-sm text-on-surface', className)} {...props} />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }