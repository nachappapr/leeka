"use client"

import { ArrowUpDown, XIcon } from "@/components/icons"
import { useDashboardActions } from "@/components/dashboard/dashboard-actions-provider"
import { DASH_STATUSES, STATUS_DOT_CLASS } from "@/lib/constants/dashboard"
import { cn } from "@/lib/utils"

// Fix #12: chip border border-line → border-ink-3
const CHIP_CLASS =
  "inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-surface-2 border border-ink-3 text-caption font-bold text-ink-2"

export function DashboardFilterSummary() {
  const { sort, statuses, setSort, setStatuses, sortLabel } = useDashboardActions()

  const hasActiveSort = sort !== "newest"
  const hasActiveFilters = statuses.length > 0

  if (!hasActiveSort && !hasActiveFilters) return null

  function removeStatus(status: string) {
    setStatuses(
      statuses.filter((s) => s !== status) as Parameters<typeof setStatuses>[0],
    )
  }

  function getStatusLabel(statusId: string): string {
    return DASH_STATUSES.find((s) => s.id === statusId)?.label ?? statusId
  }

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 pt-4 pb-2">
      {/* Sort chip */}
      {hasActiveSort && (
        <span className={CHIP_CLASS}>
          <ArrowUpDown className="size-3.5 shrink-0" aria-hidden />
          {sortLabel}
        </span>
      )}

      {/* Status chips with remove */}
      {statuses.map((status) => (
        <span key={status} className={CHIP_CLASS}>
          <span
            className={cn("size-2.5 shrink-0 rounded-full", STATUS_DOT_CLASS[status] ?? "bg-ink-3")}
            aria-hidden
          />
          {getStatusLabel(status)}
          {/* Fix #4: remove-filter button size-4 (16px) → size-7 (28px), icon stays size-3 */}
          <button
            type="button"
            onClick={() => removeStatus(status)}
            aria-label={`Remove ${getStatusLabel(status)} filter`}
            className="ml-0.5 flex size-7 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-line hover:text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-coral-press"
          >
            <XIcon className="size-3" aria-hidden />
          </button>
        </span>
      ))}

      {/* Clear all — fix #13: add aria-label */}
      <button
        type="button"
        onClick={() => {
          setSort("newest")
          setStatuses([])
        }}
        aria-label="Clear all filters and sort"
        className="inline-flex items-center h-7 px-3 rounded-full text-caption font-bold text-coral-ink transition-colors hover:bg-coral-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press"
      >
        Clear
      </button>
    </div>
  )
}
