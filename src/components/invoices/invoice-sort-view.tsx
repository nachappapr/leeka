"use client"

import { useEffect, useRef, useState } from "react"

import { ArrowDown, ArrowUp, IndianRupee, UserRound } from "@/components/icons"
import { PillButton } from "@/components/ui/custom/pill-button"
import { SortRadioRow } from "@/components/invoices/sort-radio-row"
import { useInvoiceListActions } from "@/components/invoices/invoice-list-actions-provider"
import { INVOICE_SORTS } from "@/lib/constants/invoices"
import type { InvoiceSortId } from "@/lib/types/invoice"

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

interface InvoiceSortViewProps {
  /** Called when the user applies a sort or cancels. */
  onClose: () => void
}

/**
 * Sort content rendered inside the single actions sheet.
 * Remounted whenever it enters view so draft always starts fresh from
 * the committed sort value (no setState-in-effect needed).
 */
export function InvoiceSortView({ onClose }: InvoiceSortViewProps) {
  const { sort, setSort } = useInvoiceListActions()
  const [draft, setDraft] = useState<InvoiceSortId>(sort)

  // Store DOM nodes for roving-tabindex focus management
  const rowNodes = useRef<(HTMLButtonElement | null)[]>(
    Array.from({ length: INVOICE_SORTS.length }, () => null),
  )

  // Move focus to the selected radio row when this view mounts
  useEffect(() => {
    const idx = INVOICE_SORTS.findIndex((s) => s.id === draft)
    const node = rowNodes.current[idx >= 0 ? idx : 0]
    node?.focus()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally empty — fire only on mount

  function handleGroupKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const currentIndex = INVOICE_SORTS.findIndex((s) => s.id === draft)
    let nextIndex = currentIndex

    if (e.key === "ArrowDown") {
      e.preventDefault()
      nextIndex = Math.min(currentIndex + 1, INVOICE_SORTS.length - 1)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      nextIndex = Math.max(currentIndex - 1, 0)
    } else if (e.key === "Home") {
      e.preventDefault()
      nextIndex = 0
    } else if (e.key === "End") {
      e.preventDefault()
      nextIndex = INVOICE_SORTS.length - 1
    } else {
      return
    }

    if (nextIndex !== currentIndex) {
      setDraft(INVOICE_SORTS[nextIndex].id)
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
        {INVOICE_SORTS.map((s, i) => (
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
          className="flex-1 justify-center rounded-lg!"
          onClick={onClose}
        >
          Cancel
        </PillButton>
        <PillButton
          tone="primary"
          size="md"
          className="flex-1 justify-center rounded-lg!"
          onClick={handleApply}
        >
          Apply sort
        </PillButton>
      </div>
    </>
  )
}
