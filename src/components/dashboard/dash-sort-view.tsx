"use client"

import { useEffect, useRef, useState } from "react"

import { ArrowDown, ArrowUp, IndianRupee, UserRound } from "@/components/icons"
import { PillButton } from "@/components/ui/custom/pill-button"
import { SortRadioRow } from "@/components/dashboard/sort-radio-row"
import { useDashboardActions } from "@/components/dashboard/dashboard-actions-provider"
import { DASH_SORTS } from "@/lib/constants/dashboard"
import type { DashSortId } from "@/lib/types/dashboard"

function sortIcon(iconKey: string): React.ReactNode {
  const cls = "size-5"
  switch (iconKey) {
    case "arrowDown": return <ArrowDown className={cls} aria-hidden />
    case "arrowUp":   return <ArrowUp   className={cls} aria-hidden />
    case "rupee":     return <IndianRupee className={cls} aria-hidden />
    case "user":      return <UserRound  className={cls} aria-hidden />
    default:          return <ArrowDown  className={cls} aria-hidden />
  }
}

interface DashSortViewProps {
  /** Called when the user applies a sort or cancels. */
  onClose: () => void
}

/**
 * Sort content rendered inside the single actions sheet.
 * Remounted whenever it enters view so draft always starts fresh from
 * the committed sort value (no setState-in-effect needed).
 */
export function DashSortView({ onClose }: DashSortViewProps) {
  const { sort, setSort } = useDashboardActions()
  const [draft, setDraft] = useState<DashSortId>(sort)

  // Store DOM nodes for roving-tabindex focus management
  const rowNodes = useRef<(HTMLButtonElement | null)[]>(
    Array.from({ length: DASH_SORTS.length }, () => null),
  )

  // Move focus to the selected radio row when this view mounts
  useEffect(() => {
    const idx = DASH_SORTS.findIndex((s) => s.id === draft)
    const node = rowNodes.current[idx >= 0 ? idx : 0]
    node?.focus()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally empty — fire only on mount

  function handleGroupKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const currentIndex = DASH_SORTS.findIndex((s) => s.id === draft)
    let nextIndex = currentIndex

    if (e.key === "ArrowDown") {
      e.preventDefault()
      nextIndex = Math.min(currentIndex + 1, DASH_SORTS.length - 1)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      nextIndex = Math.max(currentIndex - 1, 0)
    } else if (e.key === "Home") {
      e.preventDefault()
      nextIndex = 0
    } else if (e.key === "End") {
      e.preventDefault()
      nextIndex = DASH_SORTS.length - 1
    } else {
      return
    }

    if (nextIndex !== currentIndex) {
      setDraft(DASH_SORTS[nextIndex].id)
      rowNodes.current[nextIndex]?.focus()
    }
  }

  function handleApply() {
    setSort(draft)
    onClose()
  }

  return (
    <>
      {/* Drag handle */}
      <div className="mx-auto mt-1.5 mb-3 h-1 w-10 rounded-full bg-line-strong" aria-hidden />

      {/* Accessible name (sr-only) + visible kicker */}
      <p className="px-5 pb-2.5 text-kicker uppercase tracking-wider text-ink-3" aria-hidden>
        Sort by
      </p>

      {/* Radiogroup — tabIndex={-1} satisfies jsx-a11y, rows use roving tabindex */}
      <div
        role="radiogroup"
        aria-label="Sort invoices"
        tabIndex={-1}
        onKeyDown={handleGroupKeyDown}
        className="flex flex-col gap-2 overflow-y-auto px-3.5 max-h-96"
      >
        {DASH_SORTS.map((s, i) => (
          <SortRadioRow
            key={s.id}
            active={draft === s.id}
            icon={sortIcon(s.iconKey)}
            label={s.label}
            hint={s.hint}
            onClick={() => setDraft(s.id)}
            tabIndex={draft === s.id ? 0 : -1}
            setRowRef={(el) => { rowNodes.current[i] = el }}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex gap-2.5 px-3.5 pt-4 pb-5">
        <PillButton
          tone="outline"
          size="md"
          className="w-2/5 justify-center"
          onClick={onClose}
        >
          Cancel
        </PillButton>
        <PillButton
          tone="primary"
          size="md"
          className="w-3/5 justify-center"
          onClick={handleApply}
        >
          Apply sort
        </PillButton>
      </div>
    </>
  )
}
