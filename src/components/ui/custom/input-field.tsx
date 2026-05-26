import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Input } from "@/components/ui/primitives/input"
import { cn } from "@/lib/utils"

const inputFieldVariants = cva(
  "rounded-lg border-line bg-card font-medium",
  {
    variants: {
      size: {
        web: "h-11 px-3.5 text-body-sm",
        mobile: "h-14 px-4 text-body",
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
