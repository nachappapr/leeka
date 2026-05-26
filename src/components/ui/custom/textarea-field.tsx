import * as React from "react"

import { Textarea } from "@/components/ui/primitives/textarea"
import { cn } from "@/lib/utils"

function TextareaField({
  className,
  ...props
}: React.ComponentProps<typeof Textarea>) {
  return (
    <Textarea
      data-slot="textarea-field"
      className={cn(
        "rounded-nav-item border-line bg-card font-medium text-body-sm px-3.5 py-2.5 min-h-24 resize-y",
        className
      )}
      {...props}
    />
  )
}

export { TextareaField }
