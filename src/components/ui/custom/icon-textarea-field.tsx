import * as React from "react";

import { Textarea } from "@/components/ui/primitives/textarea";
import { cn } from "@/lib/utils";

export interface IconTextareaFieldProps extends React.ComponentProps<"textarea"> {
  leadingIcon: React.ReactNode;
  error?: boolean;
}

const IconTextareaField = React.forwardRef<HTMLTextAreaElement, IconTextareaFieldProps>(
  ({ leadingIcon, error, className, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex items-start gap-2.5 rounded-xl border-[1.5px] bg-surface px-4 py-3 transition-all focus-within:ring-4",
          error
            ? "border-overdue focus-within:border-overdue focus-within:ring-overdue/14"
            : "border-line focus-within:border-coral focus-within:ring-coral/14",
        )}
      >
        <span aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-ink-3">
          {leadingIcon}
        </span>
        <Textarea
          ref={ref}
          className={cn(
            "min-h-12 w-full resize-none border-none bg-transparent p-0 text-17 font-semibold leading-relaxed shadow-none outline-none ring-0 focus-visible:border-none focus-visible:ring-0 aria-invalid:border-none aria-invalid:ring-0",
            "text-ink placeholder:font-medium placeholder:text-line-strong",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
IconTextareaField.displayName = "IconTextareaField";

export { IconTextareaField };
