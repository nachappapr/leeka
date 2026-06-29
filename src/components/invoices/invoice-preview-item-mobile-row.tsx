import type { InvoiceLineItem } from "@/lib/types";
import { formatPaise } from "@/lib/utils";

interface InvoicePreviewItemMobileRowProps {
  item: InvoiceLineItem;
}

export function InvoicePreviewItemMobileRow({ item }: InvoicePreviewItemMobileRowProps) {
  return (
    <li className="flex items-start justify-between gap-3 border-b border-dashed border-border py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="text-body font-bold text-ink">{item.name}</div>
        <div className="tabular mt-0.5 text-caption text-ink-3">
          {item.qty} × {formatPaise(item.unitPrice)}
          {item.discount > 0 && <span> · Discount: -{formatPaise(item.discount)}</span>}
        </div>
        <div className="mt-0.5 text-caption text-ink-3">{item.gstRate}% GST</div>
      </div>
      <div className="tabular text-body font-black text-ink whitespace-nowrap">
        <span className="sr-only">Total: </span>
        {formatPaise(item.lineSubtotal)}
      </div>
    </li>
  );
}
