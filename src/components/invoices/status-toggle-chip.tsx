import { forwardRef } from "react"

import type { StatusPillStatus } from "@/components/ui/custom/status-pill"
import { STATUS_DOT_CLASS } from "@/lib/constants/invoices"
import { cn } from "@/lib/utils"

interface StatusToggleChipProps {
  status: StatusPillStatus
  label: string
  count: number
  active: boolean
  onClick: () => void
}

export const StatusToggleChip = forwardRef<HTMLButtonElement, StatusToggleChipProps>(
  function StatusToggleChip({ status, label, count, active, onClick }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={active}
        onClick={onClick}
        aria-label={`${label}, ${count} invoice${count === 1 ? "" : "s"}`}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full border-[1.5px] px-3.5 text-caption font-bold transition-[background-color,border-color,color]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
          active
            ? "border-transparent bg-ink text-white"
            : "border-ink-3 bg-surface text-ink-2 hover:bg-surface-2",
        )}
      >
        {/* Status dot — shared STATUS_DOT_CLASS; active gets the design's white ring */}
        <span
          className={cn(
            "size-2.5 shrink-0 rounded-full",
            STATUS_DOT_CLASS[status] ?? "bg-ink-3",
            active && "ring-2 ring-white/30",
          )}
          aria-hidden
        />

        {/* Label */}
        <span aria-hidden>{label}</span>

        {/* Count badge */}
        <span
          aria-hidden
          className={cn(
            "inline-flex items-center justify-center rounded-full px-2 py-px text-kicker",
            active ? "bg-white/25 text-white" : "bg-cream text-ink-3",
          )}
        >
          {count}
        </span>
      </button>
    )
  },
)
