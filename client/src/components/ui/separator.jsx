// Separator — portage du composant shadcn/ui (Radix), stylé aux tokens ServiGo.
import * as React from 'react'
import * as SeparatorPrimitive from '@radix-ui/react-separator'

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

const Separator = React.forwardRef(
  ({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cx(
        'shrink-0 bg-slate-200/70',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }