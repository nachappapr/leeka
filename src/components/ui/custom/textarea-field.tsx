import * as React from "react";

import { Textarea } from "@/components/ui/primitives/textarea";
import { cn } from "@/lib/utils";

function TextareaField({ className, ...props }: React.ComponentProps<typeof Textarea>) {
  return (
    <Textarea
      data-slot="textarea-field"
      className={cn(
        // Inputs sit on the --text-body (16) floor at all viewports — per the
        // responsive type system (Rule 4: raise to 16, don't pin per-breakpoint),
        // which also avoids iOS's <16px auto-zoom without a max-mobile override.
        "rounded-nav-item border-line bg-card font-medium text-body px-3.5 py-2.5 min-h-24 resize-y",
        className,
      )}
      {...props}
    />
  );
}

export { TextareaField };
