import * as React from "react";

import { Input } from "@/components/ui/primitives/input";
import { cn } from "@/lib/utils";

export interface IconInputFieldProps extends Omit<React.ComponentProps<"input">, "size"> {
  leadingIcon: React.ReactNode;
  error?: boolean;
  mono?: boolean;
}

const IconInputField = React.forwardRef<HTMLInputElement, IconInputFieldProps>(
  ({ leadingIcon, error, mono, className, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex h-14 items-center gap-2.5 rounded-xl border-[1.5px] bg-surface px-4 transition-all focus-within:ring-4",
          error
            ? "border-overdue focus-within:border-overdue focus-within:ring-overdue/14"
            : "border-line focus-within:border-coral focus-within:ring-coral/14",
        )}
      >
        <span aria-hidden="true" className="size-5 shrink-0 text-ink-3">
          {leadingIcon}
        </span>
        <Input
          ref={ref}
          className={cn(
            "h-auto min-w-0 flex-1 border-none bg-transparent p-0 shadow-none outline-none ring-0 focus-visible:border-none focus-visible:ring-0 aria-invalid:border-none aria-invalid:ring-0",
            mono
              ? "font-mono text-15 tracking-wide placeholder:font-sans placeholder:tracking-normal"
              : "text-17 font-semibold placeholder:font-medium",
            "text-ink placeholder:text-line-strong",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
IconInputField.displayName = "IconInputField";

export { IconInputField };
