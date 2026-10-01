// Switch — portage du composant shadcn/ui (Radix), stylé aux tokens ServiGo.
// Taille confortable (h-8) pour rester une cible tactile ≥ 32 px dans le label.
import * as React from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

const Switch = React.forwardRef(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cx(
      'peer inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-outline-variant transition-colors disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary',
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cx(
        'pointer-events-none block h-6 w-6 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-7 data-[state=unchecked]:translate-x-0'
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }