import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";

import { ChevronRight } from "@/components/icons";
import { CustomerCell } from "@/components/ui/custom/customer-cell";
import { StatusPill } from "@/components/ui/custom/status-pill";
import type { Invoice } from "@/lib/types";
import { formatInvoiceDate } from "@/lib/utils";

function parseAmount(value: string): number {
  return parseInt(value.replace(/[₹,]/g, ""), 10);
}

export const dashboardColumns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => (
      <CustomerCell customer={row.original.customer} city={row.original.city} />
    ),
  },
  {
    accessorKey: "id",
    header: "Invoice #",
    enableSorting: false,
    cell: ({ getValue }) => (
      <span className="text-body-sm font-medium text-ink-2">
        {getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: "isoDate",
    header: "Date",
    cell: ({ getValue }) => (
      <time dateTime={getValue<string>()} className="text-body-sm text-ink-2">
        {formatInvoiceDate(getValue<string>())}
      </time>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ getValue }) => <StatusPill status={getValue<Invoice["status"]>()} />,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    sortingFn: (a, b) => parseAmount(a.original.amount) - parseAmount(b.original.amount),
    cell: ({ getValue }) => (
      <span className="tabular text-body-sm font-bold text-ink">
        {getValue<string>()}
      </span>
    ),
  },
  {
    id: "action",
    enableSorting: false,
    cell: ({ row }) => (
      <Link
        href={`/invoices/${row.original.id.replace("#", "")}`}
        aria-label={`View invoice ${row.original.id}`}
        className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-ink-2 hover:border-line-strong hover:bg-coral/5 hover:text-coral-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
      >
        <ChevronRight className="size-4.5" aria-hidden />
      </Link>
    ),
  },
];
