"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("filter") as InvoiceStatusFilter | null;
  const [filter, setFilter] = useState<InvoiceStatusFilter>(
    initialFilter && INVOICES_FILTER_CHIPS.some((chip) => chip.id === initialFilter)
      ? initialFilter
      : "all",
  );

  // Mobile list driven by shared provider (sort + multi-status filter from the sheet)
  const { sort, statuses } = useInvoiceListActions();

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

  // Desktop: single-select filter from the chip row
  const filteredInvoices = useMemo(
    () => (filter === "all" ? invoices : invoices.filter((inv) => inv.status === filter)),
    [invoices, filter],
  );

  // Mobile: multi-status + sort from the sheet provider
  const mobileInvoices = useMemo(
    () => applyInvoiceSortFilter(invoices, sort, statuses),
    [invoices, sort, statuses],
  );

  return (
    <>
      {header}
      <Card>
        {/* Desktop filter chips — hidden on mobile (sheet controls mobile) */}
        <div className="max-mobile:hidden">
          <FilterChips
            items={chipItems}
            value={filter}
            onValueChange={(id) => setFilter(id as InvoiceStatusFilter)}
            ariaLabel="Filter invoices by status"
          />
        </div>
        {/* Desktop announces the chip-filtered count; mobile announces the sheet-filtered count */}
        <p role="status" className="sr-only max-mobile:hidden">
          Showing {filteredInvoices.length} invoice
          {filteredInvoices.length === 1 ? "" : "s"}
        </p>
        <p role="status" className="sr-only min-mobile:hidden">
          Showing {mobileInvoices.length} invoice
          {mobileInvoices.length === 1 ? "" : "s"}
        </p>
        {/* Desktop table — hidden on mobile */}
        <InvoicesTable invoices={filteredInvoices} />
        {/* Mobile list — driven by sheet provider state */}
        <div className="min-mobile:hidden">
          {/* Active sort/filter summary chips + Clear (mirrors dashboard) */}
          <InvoiceListFilterSummary />
          <div className="p-4">
            <InvoicesMobileList invoices={mobileInvoices} />
          </div>
        </div>
      </Card>
    </>
  );
}
