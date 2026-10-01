// Accordion — portage du composant shadcn/ui (Radix), stylé aux tokens ServiGo.
import * as React from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cx('border-b border-outline-variant/30 last:border-b-0', className)}
    {...props}
  />
))
AccordionItem.displayName = 'AccordionItem'

const AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cx(
        'group flex min-h-14 flex-1 items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-on-surface transition-colors hover:bg-primary-soft/40 focus-visible:bg-primary-soft/40',
        className
      )}
      {...props}
    >
      {children}
      <span
        className="material-symbols-outlined shrink-0 text-xl text-slate-500 transition-all duration-200 group-data-[state=open]:rotate-180 group-data-[state=open]:text-primary"
        aria-hidden="true"
      >
        expand_more
      </span>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm leading-relaxed data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cx('px-5 pb-5 text-on-surface-variant', className)}>{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }