"use client"

import { useEmptyState } from "@/components/ui/custom/empty-state-provider"
import { cn } from "@/lib/utils"

export function EmptyStateToggle() {
  const { isEmpty, toggle } = useEmptyState()

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isEmpty}
      aria-label={`Empty state: ${isEmpty ? "On" : "Off"}. Click to toggle.`}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex min-h-[48px] items-center gap-2 rounded-full border px-4 py-2.5 text-label font-bold shadow-float transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2",
        "max-mobile:bottom-[calc(72px+env(safe-area-inset-bottom)+12px)]",
        isEmpty
          ? "border-coral-press bg-coral-press text-ink"
          : "border-line-strong bg-surface text-ink-2",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-2 rounded-full transition-colors",
          isEmpty ? "bg-ink" : "bg-ink-3",
        )}
      />
      <span>Empty state: {isEmpty ? "On" : "Off"}</span>
    </button>
  )
}
