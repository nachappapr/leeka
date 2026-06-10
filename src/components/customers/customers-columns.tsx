import { type ColumnDef } from "@tanstack/react-table";

import { CustomerCell } from "@/components/ui/custom/customer-cell";
import { cn } from "@/lib/utils";
import type { Customer } from "@/lib/types";

export function parseCurrency(value: string | null): number {
  if (!value) return -1;
  return parseInt(value.replace(/[₹,]/g, ""), 10);
}

export const customerColumns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: "Customer",
    cell: ({ row }) => <CustomerCell customer={row.original.name} city={row.original.city} />,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    enableSorting: false,
    cell: ({ getValue }) => <span className="text-body-sm text-ink-2">{getValue<string>()}</span>,
  },
  {
    accessorKey: "invoiceCount",
    header: "Invoices",
    cell: ({ getValue }) => <span className="text-body-sm text-ink-2">{getValue<number>()}</span>,
  },
  {
    accessorKey: "totalBilled",
    header: "Total Billed",
    sortingFn: (a, b) =>
      parseCurrency(a.original.totalBilled) - parseCurrency(b.original.totalBilled),
    cell: ({ getValue }) => (
      <span className="tabular text-body-sm font-bold text-ink">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "outstanding",
    header: "Outstanding",
    sortingFn: (a, b) =>
      parseCurrency(a.original.outstanding) - parseCurrency(b.original.outstanding),
    cell: ({ getValue }) => {
      const v = getValue<string | null>();
      return (
        <span className={cn("tabular text-body-sm font-bold", v ? "text-coral" : "text-ink-3")}>
          {v ?? "—"}
        </span>
      );
    },
  },
];
