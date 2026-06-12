// No "use client": purely presentational — no hooks, no state.
// Rides the client boundary of the parent (InvoiceFormBody → invoice form).

import { formatRupees } from "@/lib/utils";

export interface InvoiceFormTotalsStripProps {
  subtotal: number;
  total: number;
  /** Intra-state CGST, in rupees. Show CGST+SGST rows when cgst+sgst > 0. */
  cgst: number;
  /** Intra-state SGST, in rupees. */
  sgst: number;
  /** Inter-state IGST, in rupees. Show IGST row when igst > 0. */
  igst: number;
  /** Round-off adjustment, in rupees (may be negative). Show row when nonzero. */
  roundOff: number;
}

// text-money-sm = responsive 28→24, font-weight:800, tracking; token owns all

export function InvoiceFormTotalsStrip({
  subtotal,
  total,
  cgst,
  sgst,
  igst,
  roundOff,
}: InvoiceFormTotalsStripProps) {
  const showCgstSgst = cgst + sgst > 0;
  const showIgst = igst > 0;
  const showRoundOff = roundOff !== 0;

  return (
    <div className="flex justify-end">
      <div className="w-65 space-y-1">
        <div className="flex justify-between text-body-sm text-ink-2">
          <span>Subtotal</span>
          <span className="tabular">{formatRupees(subtotal)}</span>
        </div>
        {showCgstSgst ? (
          <>
            <div className="flex justify-between text-body-sm text-ink-2">
              <span>CGST</span>
              <span className="tabular">{formatRupees(cgst)}</span>
            </div>
            <div className="flex justify-between text-body-sm text-ink-2">
              <span>SGST</span>
              <span className="tabular">{formatRupees(sgst)}</span>
            </div>
          </>
        ) : showIgst ? (
          <div className="flex justify-between text-body-sm text-ink-2">
            <span>IGST</span>
            <span className="tabular">{formatRupees(igst)}</span>
          </div>
        ) : null}
        {showRoundOff && (
          <div className="flex justify-between text-body-sm text-ink-2">
            <span>Round off</span>
            <span className="tabular">{formatRupees(roundOff)}</span>
          </div>
        )}
        <div className="flex justify-between items-baseline pt-1">
          <span className="text-body-sm font-extrabold">Total</span>
          <span className="tabular text-money-sm">{formatRupees(total)}</span>
        </div>
      </div>
    </div>
  );
}
