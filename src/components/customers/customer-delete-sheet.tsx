"use client"

// Two-step delete confirm in a mobile bottom-sheet (not a toast — delete is destructive).
import { useState } from "react"
import { MoreHorizontal, Trash2 } from "@/components/icons"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/primitives/sheet"
import type { Customer } from "@/lib/types"
import { cn } from "@/lib/utils"

interface CustomerDeleteSheetProps {
  customer: Customer
  onDelete: (customer: Customer) => void
}

export function CustomerDeleteSheet({
  customer,
  onDelete,
}: CustomerDeleteSheetProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [open, setOpen] = useState(false)

  function handleOpenChange(next: boolean) {
    setOpen(next)
    // Reset confirm step whenever the sheet closes
    if (!next) setConfirmDelete(false)
  }

  function handleDelete() {
    onDelete(customer)
    setOpen(false)
    setConfirmDelete(false)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        aria-label="More actions"
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-lg",
          "border-[1.5px] border-ink-3 bg-card text-ink-2",
          "transition-colors hover:bg-surface-2",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2",
        )}
      >
        <MoreHorizontal className="size-5" aria-hidden />
      </SheetTrigger>

      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="rounded-t-2xl border-0 gap-0 bg-card p-0 pt-2"
        aria-labelledby="delete-sheet-title"
      >
        {/* Handle */}
        <div className="mx-auto mt-1.5 mb-3 h-1 w-10 rounded-full bg-line-strong" aria-hidden />

        {/* Sheet title — kicker uppercase */}
        <p
          id="delete-sheet-title"
          className="px-5.5 pb-2.5 text-kicker uppercase tracking-wider text-ink-3"
        >
          {customer.name} · actions
        </p>

        {confirmDelete ? (
          /* ── Confirm delete step ── */
          <div className="px-5 pb-2">
            <p className="text-body-sm font-black text-ink mb-1.5">
              Delete this customer?
            </p>
            <p className="text-caption text-ink-2 mb-4 leading-relaxed">
              Their past invoices stay in your records, but they&apos;ll be removed
              from your saved customers list.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className={cn(
                  "flex-1 h-12 rounded-lg border-[1.5px] border-ink-3 bg-card",
                  "text-body-sm font-bold text-ink transition-colors hover:bg-surface-2",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2",
                )}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className={cn(
                  "flex-1 h-12 rounded-lg bg-overdue text-card",
                  "text-body-sm font-bold transition-colors hover:bg-overdue-ink",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-overdue focus-visible:ring-offset-2",
                  "inline-flex items-center justify-center gap-2",
                )}
              >
                <Trash2 className="size-4" aria-hidden />
                Yes, delete
              </button>
            </div>
            {/* Safe-area bottom clearance */}
            <div className="pb-[calc(16px+env(safe-area-inset-bottom,0))]" />
          </div>
        ) : (
          /* ── Default step ── */
          <>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className={cn(
                "flex w-full items-center gap-3.5 px-5.5 py-3.5 text-left text-body font-semibold",
                "text-overdue transition-colors hover:bg-overdue-soft/40 active:bg-background",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-overdue",
              )}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-nav-item bg-overdue-soft text-overdue">
                <Trash2 className="size-4.5" aria-hidden />
              </span>
              Delete customer
            </button>

            <div className="px-3.5 pt-2.5 pb-4">
              <SheetClose
                className={cn(
                  "h-12 w-full rounded-lg bg-background text-body font-bold text-ink",
                  "transition-colors hover:bg-surface-2",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2",
                )}
              >
                Cancel
              </SheetClose>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
