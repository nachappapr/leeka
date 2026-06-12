"use client";

import { useMemo, type ReactNode } from "react";

import { FilterChips, type FilterChipsItem } from "@/components/ui/custom/filter-chips";
import { InvoicesMobileList } from "@/components/invoices/invoices-mobile-list";
import { InvoicesTable } from "@/components/invoices/invoices-table";
import { Card } from "@/components/ui/custom/card";
import { InvoiceListFilterSummary } from "@/components/invoices/invoice-list-filter-summary";
import { useInvoiceListActions } from "@/components/invoices/invoice-list-actions-provider";
import { applyInvoiceSortFilter } from "@/lib/utils";
import { INVOICES_FILTER_CHIPS } from "@/lib/constants";
import type { Invoice, InvoiceStatusFilter } from "@/lib/types";

interface InvoicesFilterShellProps {
  invoices: ReadonlyArray<Invoice>;
  header: ReactNode;
}

export function InvoicesFilterShell({ invoices, header }: InvoicesFilterShellProps) {
  const { sort, statuses, desktopFilter, setDesktopFilter } = useInvoiceListActions();

  const chipItems = useMemo<ReadonlyArray<FilterChipsItem>>(
    () =>
      INVOICES_FILTER_CHIPS.map((chip) => ({
        id: chip.id,
        label: chip.label,
        count:
          chip.id === "all"
            ? invoices.length
            : invoices.filter((inv) => inv.status === chip.id).length,
      })),
    [invoices],
  );

  const filteredInvoices = useMemo(
    () =>
      desktopFilter === "all" ? invoices : invoices.filter((inv) => inv.status === desktopFilter),
    [invoices, desktopFilter],
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
          Showing {filteredInvoices.length} invoice
          {filteredInvoices.length === 1 ? "" : "s"}
        </p>
        <p role="status" className="sr-only min-mobile:hidden">
          Showing {mobileInvoices.length} invoice
          {mobileInvoices.length === 1 ? "" : "s"}
        </p>
        <InvoicesTable invoices={filteredInvoices} />
        <div className="min-mobile:hidden">
          <InvoiceListFilterSummary />
          <div className="p-4">
            <InvoicesMobileList invoices={mobileInvoices} />
          </div>
        </div>
      </Card>
    </>
  );
}
