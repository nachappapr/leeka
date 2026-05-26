import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Input } from "@/components/ui/primitives/input"
import { cn } from "@/lib/utils"

const inputFieldVariants = cva(
  "font-medium",
  {
    variants: {
      size: {
        web: "h-11 px-3.5 text-body-sm rounded-nav-item border-line bg-card",
        mobile: "h-14 px-4 text-body rounded-nav-item border-line bg-card",
        // Spreadsheet-style bare inputs — underline only by default, full border on hover/focus
        bare: "h-9 px-2.5 text-body-sm rounded-sm bg-background border-transparent border-b-line hover:bg-card hover:border-line focus-visible:bg-card focus-visible:border-coral focus-visible:ring-coral-soft",
      },
    },
    defaultVariants: { size: "web" },
  }
)

function InputField({
  className,
  size = "web",
  ...props
}: Omit<React.ComponentProps<typeof Input>, "size"> &
  VariantProps<typeof inputFieldVariants>) {
  return (
    <Input
      data-slot="input-field"
      data-size={size}
      className={cn(inputFieldVariants({ size }), className)}
      {...props}
    />
  )
}

export { InputField, inputFieldVariants }
