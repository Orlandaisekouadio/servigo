// Avatar — portage du composant shadcn/ui (Radix), stylé aux tokens ServiGo.
import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

const Avatar = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cx('relative flex h-12 w-12 shrink-0 overflow-hidden rounded-full', className)}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cx('aspect-square h-full w-full', className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cx(
      'flex h-full w-full items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary-deep',
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }