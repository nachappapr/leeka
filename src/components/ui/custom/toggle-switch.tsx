"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  className?: string;
}

export function ToggleSwitch({
  label,
  checked,
  onCheckedChange,
  id: externalId,
  className,
}: ToggleSwitchProps) {
  const innerId = React.useId();
  const id = externalId ?? innerId;

  return (
    <div className={cn("flex items-center justify-between border-b border-line py-3.5", className)}>
      <label htmlFor={id} className="cursor-pointer text-body-sm font-semibold text-ink">
        {label}
      </label>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative h-6.5 w-11 shrink-0 cursor-pointer rounded-full border-0 transition-colors duration-150 motion-reduce:transition-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2",
          checked ? "bg-coral" : "bg-ink-3",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute top-0.75 h-5 w-5 rounded-full bg-white shadow-press transition-[left] duration-150 motion-reduce:transition-none",
            checked ? "left-5.25" : "left-0.75",
          )}
        />
      </button>
    </div>
  );
}
