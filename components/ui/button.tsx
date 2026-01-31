import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-md hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0',
        destructive:
          'bg-destructive text-white shadow-md hover:bg-destructive/90 hover:shadow-lg hover:shadow-destructive/25',
        outline:
          'border border-border bg-transparent hover:bg-surface hover:border-foreground-subtle text-foreground',
        secondary:
          'bg-surface text-foreground shadow-sm hover:bg-surface-hover',
        ghost:
          'hover:bg-surface hover:text-foreground text-foreground-muted',
        link:
          'text-primary underline-offset-4 hover:underline',
        gradient:
          'bg-gradient-to-r from-primary to-accent-blue text-white shadow-md hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0',
        glass:
          'bg-white/5 backdrop-blur-sm border border-white/10 text-foreground hover:bg-white/10 hover:border-white/20',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 rounded-md gap-1.5 px-3 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base',
        xl: 'h-14 rounded-xl px-10 text-lg font-semibold',
        icon: 'size-10 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
