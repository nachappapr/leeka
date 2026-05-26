import { CustomerCell } from "@/components/ui/custom/customer-cell";
import { Card } from "@/components/ui/custom/card";
import {
  DataTable,
  DataHeader,
  DataHead,
  DataBody,
  DataRow,
  DataCell,
} from "@/components/ui/custom/data-table";
import { DataListRow } from "@/components/ui/custom/data-list-row";
import { StatusPill } from "@/components/ui/custom/status-pill";
import { FilterChips } from "@/components/dashboard/filter-chips";
import { INVOICES } from "@/lib/constants";

export function InvoicesCard() {
  return (
    <Card
      title="Recent invoices"
      action={
        <button
          type="button"
          className="text-sm font-bold text-coral-press hover:text-coral-ink"
        >
          View all
        </button>
      }
    >
      <FilterChips />
      <DataTable className="table-fixed max-md:hidden">
        <DataHeader>
          <DataRow className="cursor-default hover:bg-background">
            <DataHead className="w-2/6 pl-6">Customer</DataHead>
            <DataHead className="w-1/6">Invoice #</DataHead>
            <DataHead className="w-1/6">Date</DataHead>
            <DataHead className="w-1/6">Status</DataHead>
            <DataHead className="w-1/6 pr-6 text-right">Amount</DataHead>
          </DataRow>
        </DataHeader>
        <DataBody>
          {INVOICES.map((inv) => (
            <DataRow key={inv.id}>
              <DataCell className="pl-6">
                <CustomerCell customer={inv.customer} city={inv.city} />
              </DataCell>
              <DataCell className="text-sm font-medium text-ink-2">
                {inv.id}
              </DataCell>
              <DataCell className="text-sm text-ink-2">{inv.date}</DataCell>
              <DataCell>
                <StatusPill status={inv.status} />
              </DataCell>
              <DataCell className="tabular pr-6 text-right text-sm font-bold text-ink">
                {inv.amount}
              </DataCell>
            </DataRow>
          ))}
        </DataBody>
      </DataTable>
      <ul
        aria-label="Recent invoices"
        className="flex flex-col gap-3 p-4 md:hidden"
      >
        {INVOICES.map((inv) => (
          <DataListRow key={inv.id} invoice={inv} />
        ))}
      </ul>
    </Card>
  );
}
