// No "use client": purely presentational — no hooks, no state.
// Rides the client boundary of the parent (InvoiceFormBody → invoice form).

import { formatRupees } from "@/lib/utils";

export interface InvoiceFormTotalsStripProps {
  subtotal: number;
  taxTotal: number;
  total: number;
}

// text-money-sm = responsive 28→24, font-weight:800, tracking; token owns all

export function InvoiceFormTotalsStrip({ subtotal, taxTotal, total }: InvoiceFormTotalsStripProps) {
  return (
    <div className="flex justify-end">
      <div className="w-65 space-y-1">
        <div className="flex justify-between text-body-sm text-ink-2">
          <span>Subtotal</span>
          <span className="tabular">{formatRupees(subtotal)}</span>
        </div>
        <div className="flex justify-between text-body-sm text-ink-2">
          <span>GST</span>
          <span className="tabular">{formatRupees(taxTotal)}</span>
        </div>
        <div className="flex justify-between items-baseline pt-1">
          <span className="text-body-sm font-extrabold">Total</span>
          <span className="tabular text-money-sm">{formatRupees(total)}</span>
        </div>
      </div>
    </div>
  );
}
