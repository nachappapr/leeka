import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const iconButtonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-lg transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      size: {
        sm: "size-8",
        md: "size-9",
        lg: "size-11",
      },
      tone: {
        ghost: "bg-transparent text-ink-2 hover:bg-surface-2",
        destructive: "bg-transparent text-overdue hover:bg-overdue-soft",
      },
    },
    defaultVariants: {
      size: "md",
      tone: "ghost",
    },
  },
)

function IconButton({
  className,
  size = "md",
  tone = "ghost",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof iconButtonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="icon-button"
      data-tone={tone}
      className={cn(iconButtonVariants({ size, tone }), className)}
      {...props}
    />
  )
}

export { IconButton, iconButtonVariants }
