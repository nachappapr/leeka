import * as React from "react"

import { cn } from "@/lib/utils"

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<"label">) {
  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control -- generic label primitive; consumer supplies htmlFor or nests a control
    <label
      data-slot="field-label"
      className={cn(
        "mb-1.5 block text-label font-bold tracking-wide text-ink-2 uppercase",
        className
      )}
      {...props}
    />
  )
}

export { FieldLabel }
