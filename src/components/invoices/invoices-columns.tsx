import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";

import { CustomerCell } from "@/components/ui/custom/customer-cell";
import { StatusPill } from "@/components/ui/custom/status-pill";
import type { Invoice } from "@/lib/types";
import { formatInvoiceDate } from "@/lib/utils";
import { InvoiceRowActionsMenu } from "./invoice-row-actions-menu";

export function parseAmount(value: string): number {
  return parseInt(value.replace(/[₹,]/g, ""), 10);
}

export const invoiceColumns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => (
      <Link
        href={`/invoices/${row.original.id.replace("#", "")}`}
        aria-label={`View invoice ${row.original.id} for ${row.original.customer}`}
        className="inline-flex rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
      >
        <CustomerCell customer={row.original.customer} city={row.original.city} />
      </Link>
    ),
  },
  {
    accessorKey: "id",
    header: "Invoice #",
    enableSorting: false,
    cell: ({ getValue }) => (
      <span className="text-body-sm font-medium text-ink-2">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "isoDate",
    header: "Issued",
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
      <span className="tabular text-body-sm font-bold text-ink">{getValue<string>()}</span>
    ),
  },
  {
    id: "action",
    enableSorting: false,
    cell: ({ row }) => <InvoiceRowActionsMenu invoice={row.original} />,
  },
];
