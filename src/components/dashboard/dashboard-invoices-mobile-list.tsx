"use client";

import { useMemo } from "react";

import { DataListRow } from "@/components/ui/custom/data-list-row";
import { DashboardFilterSummary } from "@/components/dashboard/dashboard-filter-summary";
import { useDashboardActions } from "@/components/dashboard/dashboard-actions-provider";
import { applyDashSortFilter } from "@/lib/utils";
import type { Invoice } from "@/lib/types";

interface DashboardInvoicesMobileListProps {
  invoices: ReadonlyArray<Invoice>;
}

/**
 * Mobile-only recent-invoices list. Sort + status filter are driven by the
 * dashboard actions context (the ⋯ bottom sheet); the summary chips + Clear
 * surface the active selection. Desktop uses the table in the shell instead.
 */
export function DashboardInvoicesMobileList({
  invoices,
}: DashboardInvoicesMobileListProps) {
  const { sort, statuses } = useDashboardActions();

  const mobileInvoices = useMemo(
    () => applyDashSortFilter(invoices, sort, statuses),
    [invoices, sort, statuses],
  );

  return (
    <div className="min-mobile:hidden">
      {/* Live region mirroring the desktop one */}
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {mobileInvoices.length} invoice{mobileInvoices.length === 1 ? "" : "s"} shown
      </p>
      <DashboardFilterSummary />
      {mobileInvoices.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <p className="text-body-sm font-bold text-ink-2">No invoices match</p>
          <p className="mt-1 text-caption text-ink-3">Try clearing a filter.</p>
        </div>
      ) : (
        <ul aria-label="Recent invoices" className="flex flex-col gap-3 p-4">
          {mobileInvoices.map((inv) => (
            <DataListRow key={inv.id} invoice={inv} />
          ))}
        </ul>
      )}
    </div>
  );
}
