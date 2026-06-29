import type { InvoiceLineItem } from "@/lib/types";
import { formatPaise } from "@/lib/utils";

interface InvoicePreviewItemRowProps {
  item: InvoiceLineItem;
}

export function InvoicePreviewItemRow({ item }: InvoicePreviewItemRowProps) {
  return (
    <tr>
      <td className="border-b border-border px-3.5 py-3.5 text-body-sm font-medium text-ink">
        <div>{item.name}</div>
        <div className="text-caption text-ink-3">{item.gstRate}% GST</div>
      </td>
      <td className="tabular border-b border-border px-3.5 py-3.5 text-right text-body-sm font-bold text-ink-2">
        {item.qty}
      </td>
      <td className="border-b border-border px-3.5 py-3.5 text-right text-body-sm font-bold text-ink-2">
        <div className="tabular">{formatPaise(item.unitPrice)}</div>
        {item.discount > 0 && (
          <div className="tabular text-caption text-ink-3">
            Discount: -{formatPaise(item.discount)}
          </div>
        )}
      </td>
      <td className="tabular border-b border-border px-3.5 py-3.5 text-right text-body-sm font-semibold text-ink">
        {formatPaise(item.lineSubtotal)}
      </td>
    </tr>
  );
}
