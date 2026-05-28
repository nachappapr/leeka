"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";

import {
  FilterChips,
  type FilterChipsItem,
} from "@/components/ui/custom/filter-chips";
import { InvoicesMobileList } from "@/components/invoices/invoices-mobile-list";
import { InvoicesTable } from "@/components/invoices/invoices-table";
import { Card } from "@/components/ui/custom/card";
import { INVOICES_FILTER_CHIPS } from "@/lib/constants";
import type { Invoice, InvoiceStatusFilter } from "@/lib/types";

const VALID_FILTERS: ReadonlyArray<InvoiceStatusFilter> = [
  "all", "paid", "sent", "viewed", "overdue", "draft",
];

interface InvoicesFilterShellProps {
  invoices: ReadonlyArray<Invoice>;
  header: ReactNode;
}

export function InvoicesFilterShell({
  invoices,
  header,
}: InvoicesFilterShellProps) {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("filter") as InvoiceStatusFilter | null;
  const [filter, setFilter] = useState<InvoiceStatusFilter>(
    initialFilter && VALID_FILTERS.includes(initialFilter) ? initialFilter : "all",
  );

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
      filter === "all"
        ? invoices
        : invoices.filter((inv) => inv.status === filter),
    [invoices, filter],
  );

  return (
    <>
      {header}
      <Card>
        <FilterChips
          items={chipItems}
          value={filter}
          onValueChange={(id) => setFilter(id as InvoiceStatusFilter)}
          ariaLabel="Filter invoices by status"
        />
        <p role="status" className="sr-only">
          Showing {filteredInvoices.length} invoice
          {filteredInvoices.length === 1 ? "" : "s"}
        </p>
        <InvoicesTable invoices={filteredInvoices} />
        <div className="p-4 min-mobile:hidden">
          <InvoicesMobileList invoices={filteredInvoices} />
        </div>
      </Card>
    </>
  );
}
