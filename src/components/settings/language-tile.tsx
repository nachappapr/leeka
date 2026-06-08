"use client"

import { cn } from "@/lib/utils"
import type { LanguageOption } from "@/lib/types/settings"

interface LanguageTileProps {
  language: LanguageOption
  selected: boolean
  onSelect: () => void
}

export function LanguageTile({ language, selected, onSelect }: LanguageTileProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      lang={language.lang}
      onClick={onSelect}
      className={cn(
        "rounded-xl px-4 py-3.5 text-left transition-colors motion-reduce:transition-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2",
        selected
          ? "border-2 border-coral-press bg-coral-soft"
          : "border border-ink-3 bg-card hover:border-line-strong",
      )}
    >
      <div className="text-body font-bold text-ink">{language.label}</div>
      <div className="mt-0.5 text-label text-ink-3">{language.sub}</div>
    </button>
  )
}
