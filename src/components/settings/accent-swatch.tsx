"use client";

import { Check } from "@/components/icons";
import { cn } from "@/lib/utils";

interface AccentSwatchProps {
  color: string;
  selected: boolean;
  onSelect: () => void;
}

export function AccentSwatch({ color, selected, onSelect }: AccentSwatchProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-label={`Select accent colour ${color}`}
      aria-checked={selected}
      onClick={onSelect}
      // eslint-disable-next-line no-restricted-syntax -- data-driven CSS var; color from SETTINGS_ACCENTS constant
      style={{ ["--swatch" as string]: color }}
      className={cn(
        "flex h-10.5 w-10.5 shrink-0 cursor-pointer items-center justify-center rounded-full border-[3px] transition-[border-color] motion-reduce:transition-none",
        "bg-(--swatch)",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2",
        selected ? "border-ink" : "border-transparent",
      )}
    >
      {selected && <Check size={18} strokeWidth={3} className="text-white" />}
    </button>
  );
}
