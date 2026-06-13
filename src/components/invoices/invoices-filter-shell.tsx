"use client";

import { useMemo, type ReactNode } from "react";

import { FilterChips, type FilterChipsItem } from "@/components/ui/custom/filter-chips";
import { InvoicesMobileList } from "@/components/invoices/invoices-mobile-list";
import { InvoicesTable } from "@/components/invoices/invoices-table";
import { InvoicesLoadMore } from "@/components/invoices/invoices-load-more";
import { Card } from "@/components/ui/custom/card";
import { InvoiceListFilterSummary } from "@/components/invoices/invoice-list-filter-summary";
import { useInvoiceListActions } from "@/components/invoices/invoice-list-actions-provider";
import { applyInvoiceSortFilter } from "@/lib/utils";
import { INVOICES_FILTER_CHIPS } from "@/lib/constants";
import type { Invoice, InvoiceStatusFilter } from "@/lib/types";
import type { InvoiceStatusCounts } from "@/lib/types/invoice";

interface InvoicesFilterShellProps {
  invoices: ReadonlyArray<Invoice>;
  header: ReactNode;
  statusCounts: InvoiceStatusCounts;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export function InvoicesFilterShell({
  invoices,
  header,
  statusCounts,
  hasMore,
  isLoading,
  onLoadMore,
}: InvoicesFilterShellProps) {
  const { sort, statuses, desktopFilter, setDesktopFilter } = useInvoiceListActions();

  const chipItems = useMemo<ReadonlyArray<FilterChipsItem>>(
    () =>
      INVOICES_FILTER_CHIPS.map((chip) => ({
        id: chip.id,
        label: chip.label,
        count: statusCounts[chip.id as InvoiceStatusFilter] ?? 0,
      })),
    [statusCounts],
  );

  const mobileInvoices = useMemo(
    () => applyInvoiceSortFilter(invoices, sort, statuses),
    [invoices, sort, statuses],
  );

  return (
    <>
      {header}
      <Card>
        <div className="max-mobile:hidden">
          <FilterChips
            items={chipItems}
            value={desktopFilter}
            onValueChange={(id) => setDesktopFilter(id as InvoiceStatusFilter)}
            ariaLabel="Filter invoices by status"
          />
        </div>
        <p role="status" className="sr-only max-mobile:hidden">
          Showing {invoices.length} invoice
          {invoices.length === 1 ? "" : "s"}
        </p>
        <p role="status" className="sr-only min-mobile:hidden">
          Showing {mobileInvoices.length} invoice
          {mobileInvoices.length === 1 ? "" : "s"}
        </p>
        <InvoicesTable invoices={invoices} />
        <div className="min-mobile:hidden">
          <InvoiceListFilterSummary />
          <div className="p-4">
            <InvoicesMobileList invoices={mobileInvoices} />
          </div>
        </div>
        <InvoicesLoadMore hasMore={hasMore} isLoading={isLoading} onLoadMore={onLoadMore} />
      </Card>
    </>
  );
}
