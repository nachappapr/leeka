"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ChevronRight } from "@/components/icons";
import { CustomerCell } from "@/components/ui/custom/customer-cell";
import {
  DataBody,
  DataCell,
  DataHead,
  DataHeader,
  DataRow,
  DataTable,
} from "@/components/ui/custom/data-table";
import { DataListRow } from "@/components/ui/custom/data-list-row";
import {
  FilterChips,
  type FilterChipsItem,
} from "@/components/ui/custom/filter-chips";
import { StatusPill } from "@/components/ui/custom/status-pill";
import { INVOICES_FILTER_CHIPS } from "@/lib/constants";
import type { Invoice, InvoiceStatusFilter } from "@/lib/types";
import { formatInvoiceDate } from "@/lib/utils";

interface DashboardInvoicesShellProps {
  invoices: ReadonlyArray<Invoice>;
}

export function DashboardInvoicesShell({
  invoices,
}: DashboardInvoicesShellProps) {
  const [filter, setFilter] = useState<InvoiceStatusFilter>("all");

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
      <DataTable
        className="table-fixed max-mobile:hidden"
        aria-label="Recent invoices"
      >
        <DataHeader>
          <DataRow className="cursor-default hover:bg-background">
            <DataHead className="w-2/6 pl-6">Customer</DataHead>
            <DataHead className="w-1/6">Invoice #</DataHead>
            <DataHead className="w-1/6">Date</DataHead>
            <DataHead className="w-1/6">Status</DataHead>
            <DataHead className="w-1/6 text-right">Amount</DataHead>
            <DataHead className="w-15 pr-6" aria-hidden />
          </DataRow>
        </DataHeader>
        <DataBody>
          {filteredInvoices.map((inv) => (
            <DataRow key={inv.id}>
              <DataCell className="pl-6">
                <CustomerCell customer={inv.customer} city={inv.city} />
              </DataCell>
              <DataCell className="text-body-sm font-medium text-ink-2">
                {inv.id}
              </DataCell>
              <DataCell className="text-body-sm text-ink-2">
                <time dateTime={inv.isoDate}>{formatInvoiceDate(inv.isoDate)}</time>
              </DataCell>
              <DataCell>
                <StatusPill status={inv.status} />
              </DataCell>
              <DataCell className="tabular text-right text-body-sm font-bold text-ink">
                {inv.amount}
              </DataCell>
              <DataCell className="pr-6 text-center">
                <Link
                  href={`/invoices/${inv.id.replace("#", "")}`}
                  aria-label={`View invoice ${inv.id}`}
                  className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-ink-2 hover:border-line-strong hover:bg-coral/5 hover:text-coral-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
                >
                  <ChevronRight className="size-4.5" aria-hidden />
                </Link>
              </DataCell>
            </DataRow>
          ))}
        </DataBody>
      </DataTable>
      <ul
        aria-label="Recent invoices"
        className="flex flex-col gap-3 p-4 min-mobile:hidden"
      >
        {filteredInvoices.map((inv) => (
          <DataListRow key={inv.id} invoice={inv} />
        ))}
      </ul>
    </>
  );
}
