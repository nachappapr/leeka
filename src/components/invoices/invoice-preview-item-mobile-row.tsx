import type { InvoiceLineItem } from "@/lib/types"
import { formatRupees } from "@/lib/utils"

interface InvoicePreviewItemMobileRowProps {
  item: InvoiceLineItem
}

export function InvoicePreviewItemMobileRow({
  item,
}: InvoicePreviewItemMobileRowProps) {
  const lineTotal = item.qty * item.unitPrice
  return (
    <li className="flex items-start justify-between gap-3 border-b border-dashed border-border py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="text-body-sm font-semibold text-ink">{item.name}</div>
        <div className="tabular mt-0.5 text-12 text-ink-3">
          {item.qty} × {formatRupees(item.unitPrice)}
        </div>
      </div>
      <div className="tabular text-15 font-black text-ink whitespace-nowrap">
        {formatRupees(lineTotal)}
      </div>
    </li>
  )
}
