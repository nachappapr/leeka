import type React from "react"

import { Check } from "@/components/icons"
import { cn } from "@/lib/utils"

interface SortRadioRowProps {
  active: boolean
  icon: React.ReactNode
  label: string
  hint: string
  onClick: () => void
  /** Fix #1: roving-tabindex — 0 when this row is the selected option, -1 otherwise */
  tabIndex: number
  /** Fix #1: callback ref so the parent can imperatively focus this row on arrow-key nav */
  setRowRef: (el: HTMLButtonElement | null) => void
}

export function SortRadioRow({
  active,
  icon,
  label,
  hint,
  onClick,
  tabIndex,
  setRowRef,
}: SortRadioRowProps) {
  return (
    <button
      ref={setRowRef}
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      tabIndex={tabIndex}
      className={cn(
        "flex w-full items-center gap-3.5 rounded-lg border-[1.5px] px-3.5 py-3 text-left transition-[background-color,border-color]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
        active
          ? "border-coral-press bg-coral-soft"
          // Fix #6: inactive border border-line → border-ink-3; hover border-line-strong → border-ink-2
          : "border-ink-3 bg-cream hover:border-ink-2 hover:bg-surface-2",
      )}
    >
      {/* Icon tile */}
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-nav-item",
          active ? "bg-coral text-white" : "bg-surface text-ink-3",
        )}
        aria-hidden
      >
        {icon}
      </span>

      {/* Label + hint */}
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-15 font-bold",
            active ? "text-coral-ink" : "text-ink",
          )}
        >
          {label}
        </span>
        <span className="block text-label text-ink-3">{hint}</span>
      </span>

      {/* Radio indicator — fix #7: active border-coral bg-coral → border-coral-press bg-coral-press */}
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full border-2",
          active ? "border-coral-press bg-coral-press" : "border-ink-3 bg-transparent",
        )}
        aria-hidden
      >
        {active && <Check className="size-4 text-white" strokeWidth={3} />}
      </span>
    </button>
  )
}
