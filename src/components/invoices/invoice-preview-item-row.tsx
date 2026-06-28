import type { InvoiceLineItem } from "@/lib/types";
import { formatPaise } from "@/lib/utils";

interface InvoicePreviewItemRowProps {
  item: InvoiceLineItem;
}

export function InvoicePreviewItemRow({ item }: InvoicePreviewItemRowProps) {
  const lineTotal = item.qty * item.unitPrice;
  return (
    <tr>
      <td className="border-b border-border px-3.5 py-3.5 text-body-sm font-medium text-ink">
        {item.name}
      </td>
      <td className="tabular border-b border-border px-3.5 py-3.5 text-right text-body-sm font-bold text-ink-2">
        {item.qty}
      </td>
      <td className="tabular border-b border-border px-3.5 py-3.5 text-right text-body-sm font-bold text-ink-2">
        {formatPaise(item.unitPrice)}
      </td>
      <td className="tabular border-b border-border px-3.5 py-3.5 text-right text-body-sm font-semibold text-ink">
        {formatPaise(lineTotal)}
      </td>
    </tr>
  );
}
