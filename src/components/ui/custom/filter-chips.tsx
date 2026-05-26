'use client'

import { cn } from "@/lib/utils"

export interface FilterChipsItem {
  id: string
  label: string
  count?: number
}

interface FilterChipsProps {
  items: ReadonlyArray<FilterChipsItem>
  value: string
  onValueChange: (id: string) => void
  ariaLabel?: string
  className?: string
}

export function FilterChips({
  items,
  value,
  onValueChange,
  ariaLabel,
  className,
}: FilterChipsProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "flex items-center gap-2 overflow-x-auto px-6 py-3 scrollbar-none",
        className,
      )}
    >
      {items.map((item) => {
        const isActive = item.id === value
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onValueChange(item.id)}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-body-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
              isActive
                ? "bg-ink text-white"
                : "border border-ink-3 bg-card text-ink-2 hover:bg-surface-2",
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-2 py-px text-label font-extrabold",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-background text-ink-3",
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
