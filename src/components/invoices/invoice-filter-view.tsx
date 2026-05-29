"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { PillButton } from "@/components/ui/custom/pill-button"
import { StatusToggleChip } from "@/components/invoices/status-toggle-chip"
import { useInvoiceListActions } from "@/components/invoices/invoice-list-actions-provider"
import { INVOICE_STATUS_OPTIONS } from "@/lib/constants/invoices"
import type { StatusPillStatus } from "@/components/ui/custom/status-pill"

interface InvoiceFilterViewProps {
  /** Called when the user applies a filter or cancels. */
  onClose: () => void
}

/**
 * Filter content rendered inside the single actions sheet.
 * Remounted whenever it enters view so draft always starts fresh from
 * the committed statuses value (no setState-in-effect needed).
 */
export function InvoiceFilterView({ onClose }: InvoiceFilterViewProps) {
  const { statuses, setStatuses, invoices } = useInvoiceListActions()
  const [draft, setDraft] = useState<StatusPillStatus[]>([...statuses])

  // Ref to the first chip button for focus management
  const firstChipRef = useRef<HTMLButtonElement | null>(null)

  // Move focus to the first chip when this view mounts
  useEffect(() => {
    firstChipRef.current?.focus()
  }, []) // intentionally empty — fire only on mount

  function toggle(status: StatusPillStatus) {
    setDraft((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    )
  }

  const countBy = (status: StatusPillStatus) =>
    invoices.filter((inv) => inv.status === status).length

  const matched = useMemo(
    () =>
      draft.length === 0
        ? invoices.length
        : invoices.filter((inv) => draft.includes(inv.status)).length,
    [draft, invoices],
  )

  function handleApply() {
    setStatuses(draft)
    onClose()
  }

  return (
    <>
      {/* Drag handle */}
      <div className="mx-auto mt-1.5 mb-3 h-1 w-10 rounded-full bg-line-strong" aria-hidden />

      {/* Visible kicker — also labels the status chip group */}
      <p
        id="invoice-filter-status-group-label"
        className="px-5 pb-2.5 text-kicker uppercase tracking-wider text-ink-3"
      >
        Filter by status
      </p>

      {/* Status chips */}
      <div
        role="group"
        aria-labelledby="invoice-filter-status-group-label"
        className="flex flex-wrap gap-2 px-5"
      >
        {INVOICE_STATUS_OPTIONS.map((s, i) => (
          <StatusToggleChip
            key={s.id}
            ref={i === 0 ? firstChipRef : undefined}
            status={s.id}
            label={s.label}
            count={countBy(s.id)}
            active={draft.includes(s.id)}
            onClick={() => toggle(s.id)}
          />
        ))}
      </div>

      {/* Helper text */}
      <p className="px-5 pt-3.5 text-caption text-ink-3">
        {draft.length === 0
          ? "Showing all statuses. Tap to narrow down."
          : `${draft.length} status${draft.length > 1 ? "es" : ""} selected.`}
      </p>

      {/* Live count — announced by screen reader */}
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {matched} invoice{matched === 1 ? "" : "s"} match
      </p>

      {/* Footer */}
      <div className="flex gap-2.5 px-3.5 pt-4 pb-5">
        <PillButton
          tone="outline"
          size="md"
          disabled={draft.length === 0}
          onClick={() => setDraft([])}
          className="flex-1 justify-center rounded-lg!"
        >
          Reset
        </PillButton>
        <PillButton
          tone="primary"
          size="md"
          className="flex-1 justify-center rounded-lg!"
          onClick={handleApply}
        >
          Show {matched} invoice{matched === 1 ? "" : "s"}
        </PillButton>
      </div>
    </>
  )
}
