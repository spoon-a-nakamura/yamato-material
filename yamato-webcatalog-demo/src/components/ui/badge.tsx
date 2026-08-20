import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded border px-1.5 py-px text-[0.6875rem] font-medium leading-4 whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border text-muted-foreground',
        solid: 'border-transparent bg-primary text-primary-foreground',
        internal: 'border-internal-border bg-internal-bg text-internal-fg',
        demo: 'border-amber-300 bg-amber-50 text-amber-800',
        warn: 'border-orange-300 bg-orange-50 text-orange-800',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export function Badge({
  className, variant, ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
export { badgeVariants }
