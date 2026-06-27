"use client";

import { useMemo, type ReactNode, type RefObject } from "react";
import { type PaginationState } from "@tanstack/react-table";

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
  rows: ReadonlyArray<Invoice>;
  desktopPage: ReadonlyArray<Invoice>;
  header: ReactNode;
  statusCounts: InvoiceStatusCounts;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  total?: number;
  onPaginationChange: (
    updater: PaginationState | ((prev: PaginationState) => PaginationState),
  ) => void;
  tableTopRef: RefObject<HTMLDivElement | null>;
}

export function InvoicesFilterShell({
  rows,
  desktopPage,
  header,
  statusCounts,
  hasMore,
  isLoading,
  onLoadMore,
  pageIndex,
  pageSize,
  pageCount,
  total,
  onPaginationChange,
  tableTopRef,
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
    () => applyInvoiceSortFilter(rows, sort, statuses),
    [rows, sort, statuses],
  );

  const from = pageIndex * pageSize + 1;
  const to = pageIndex * pageSize + desktopPage.length;

  return (
    <>
      {header}
      <Card>
        <div
          ref={tableTopRef}
          tabIndex={-1}
          className="sr-only"
          aria-label={`Invoices, page ${pageIndex + 1}`}
        />
        <div className="max-mobile:hidden">
          <FilterChips
            items={chipItems}
            value={desktopFilter}
            onValueChange={(id) => setDesktopFilter(id as InvoiceStatusFilter)}
            ariaLabel="Filter invoices by status"
          />
        </div>
        <p role="status" className="sr-only max-mobile:hidden">
          {`Showing invoices ${from}–${to}${typeof total === "number" ? ` of ${total}` : ""}`}
        </p>
        <p role="status" className="sr-only min-mobile:hidden">
          Showing {mobileInvoices.length} invoice
          {mobileInvoices.length === 1 ? "" : "s"}
        </p>
        <InvoicesTable
          invoices={desktopPage}
          pageIndex={pageIndex}
          pageSize={pageSize}
          pageCount={pageCount}
          total={total}
          isLoading={isLoading}
          onPaginationChange={onPaginationChange}
        />
        <div className="min-mobile:hidden">
          <InvoiceListFilterSummary />
          <div className="p-4">
            <InvoicesMobileList invoices={mobileInvoices} />
          </div>
          <InvoicesLoadMore hasMore={hasMore} isLoading={isLoading} onLoadMore={onLoadMore} />
        </div>
      </Card>
    </>
  );
}
