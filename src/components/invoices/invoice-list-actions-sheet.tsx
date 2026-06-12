"use client";

import type React from "react";
import { useEffect, useRef } from "react";

import { ArrowUpDown, Download, ListFilter } from "@/components/icons";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui/primitives/sheet";
import { ActionSheetRow } from "@/components/invoices/action-sheet-row";
import { InvoiceSortView } from "@/components/invoices/invoice-sort-view";
import { InvoiceFilterView } from "@/components/invoices/invoice-filter-view";
import { useInvoiceListActions } from "@/components/invoices/invoice-list-actions-provider";
import type { ActionsView } from "@/components/invoices/invoice-list-actions-trigger";

interface InvoiceListActionsSheetProps {
  view: ActionsView;
  onViewChange: (v: ActionsView) => void;
  /** Ref to the ⋯ trigger button for focus restoration on close */
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

/**
 * Single-dialog actions sheet. The `view` state machine drives content:
 *   "menu"   → three action rows (Sort / Filter / Export)
 *   "sort"   → sort radiogroup
 *   "filter" → filter chips
 *   null     → closed (dialog unmounted)
 *
 * Using one dialog eliminates the overlapping open/close lifecycle bug
 * that left Base UI's backdrop in the DOM indefinitely, blocking pointer
 * events on the trigger after a nested sheet was applied.
 */
export function InvoiceListActionsSheet({
  view,
  onViewChange,
  triggerRef,
}: InvoiceListActionsSheetProps) {
  const { sortLabel, filterLabel, statuses, openExport } = useInvoiceListActions();

  // Focus the first menu row when swapping BACK to the menu view from
  // a nested view. When the dialog opens fresh, Base UI handles initial
  // focus; this effect only fires when view transitions to "menu" while
  // the dialog is already open.
  const firstMenuRowRef = useRef<HTMLButtonElement | null>(null);
  const prevView = useRef<ActionsView>(null);

  useEffect(() => {
    if (view === "menu" && prevView.current !== null && prevView.current !== "menu") {
      // Returned to menu from sort/filter — move focus to first row
      firstMenuRowRef.current?.focus();
    }
    prevView.current = view;
  }, [view]);

  // Accessible title per view
  const dialogTitle =
    view === "sort" ? "Sort by" : view === "filter" ? "Filter by status" : "Invoice actions";

  return (
    <Sheet
      open={view !== null}
      onOpenChange={(open) => {
        if (!open) onViewChange(null);
      }}
    >
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="rounded-t-2xl border-0 gap-0 bg-card p-0 pt-2"
        finalFocus={triggerRef}
      >
        {/* sr-only title — updates per view for WCAG 2.5.3 */}
        <SheetTitle className="sr-only">{dialogTitle}</SheetTitle>

        {/* ── Menu view ── */}
        {view === "menu" && (
          <>
            {/* Drag handle */}
            <div className="mx-auto mt-1.5 mb-3 h-1 w-10 rounded-full bg-line-strong" aria-hidden />

            {/* Visible kicker (decorative — accessible name is the sr-only SheetTitle) */}
            <p className="px-5 pb-2.5 text-kicker uppercase tracking-wider text-ink-3" aria-hidden>
              Invoices · actions
            </p>

            <ActionSheetRow
              ref={firstMenuRowRef}
              icon={<ArrowUpDown className="size-4.5" aria-hidden />}
              label="Sort by"
              subtitle={sortLabel}
              onClick={() => onViewChange("sort")}
            />

            <ActionSheetRow
              icon={<ListFilter className="size-4.5" aria-hidden />}
              label="Filter"
              subtitle={filterLabel}
              badge={statuses.length}
              onClick={() => onViewChange("filter")}
            />

            <ActionSheetRow
              icon={<Download className="size-4.5" aria-hidden />}
              label="Export as PDF"
              onClick={() => {
                onViewChange(null);
                openExport(undefined, triggerRef);
              }}
            />

            {/* Cancel */}
            <div className="px-3.5 pt-2.5 pb-4">
              <SheetClose className="h-12 w-full rounded-lg bg-background text-15 font-bold text-ink transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2">
                Cancel
              </SheetClose>
            </div>
          </>
        )}

        {/* ── Sort view — conditional render gives fresh mount each time ── */}
        {view === "sort" && <InvoiceSortView onClose={() => onViewChange(null)} />}

        {/* ── Filter view — conditional render gives fresh mount each time ── */}
        {view === "filter" && <InvoiceFilterView onClose={() => onViewChange(null)} />}
      </SheetContent>
    </Sheet>
  );
}
