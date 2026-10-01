// Progress — portage du composant shadcn/ui (Radix), stylé aux tokens ServiGo.
import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

const Progress = React.forwardRef(({ className, value = 0, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cx('relative h-2.5 w-full overflow-hidden rounded-full bg-primary/15', className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 rounded-full bg-primary transition-[transform]"
      style={{ transform: `translateX(-${100 - value}%)` }}
      aria-hidden="true"
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }