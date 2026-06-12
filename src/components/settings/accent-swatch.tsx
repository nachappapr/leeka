"use client";

import { Check } from "@/components/icons";
import { SETTINGS_ACCENT_LABELS } from "@/lib/constants/settings";
import { cn } from "@/lib/utils";

interface AccentSwatchProps {
  color: string;
  selected: boolean;
  onSelect: () => void;
  tabIndex: number;
}

export function AccentSwatch({ color, selected, onSelect, tabIndex }: AccentSwatchProps) {
  const label = SETTINGS_ACCENT_LABELS[color] ?? color;
  return (
    <button
      type="button"
      role="radio"
      aria-label={`Accent colour: ${label}`}
      aria-checked={selected}
      tabIndex={tabIndex}
      onClick={onSelect}
      // eslint-disable-next-line no-restricted-syntax -- data-driven CSS var; color from SETTINGS_ACCENTS constant
      style={{ ["--swatch" as string]: color }}
      className={cn(
        "flex h-10.5 w-10.5 shrink-0 cursor-pointer items-center justify-center rounded-full border-[3px] transition-[border-color] motion-reduce:transition-none",
        "bg-(--swatch)",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2",
        selected ? "border-ink ring-2 ring-inset ring-white" : "border-transparent",
      )}
    >
      {selected && <Check size={18} strokeWidth={3} className="text-white" />}
    </button>
  );
}
