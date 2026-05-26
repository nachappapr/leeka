import { DataListRow } from "@/components/ui/custom/data-list-row"
import type { Invoice } from "@/lib/types"

interface InvoicesMobileListProps {
  invoices: ReadonlyArray<Invoice>
}

export function InvoicesMobileList({ invoices }: InvoicesMobileListProps) {
  return (
    <ul
      aria-label="Invoices"
      className="flex flex-col gap-3 min-mobile:hidden"
    >
      {invoices.map((inv) => (
        <DataListRow key={inv.id} invoice={inv} />
      ))}
    </ul>
  )
}
