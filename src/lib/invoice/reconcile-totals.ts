import type { ComputedTotals } from "@/lib/invoice/compute-totals";
import type { SaveDraftResult } from "@/lib/types/invoice";

export function hasTotalsMismatch(estimate: ComputedTotals, saved: SaveDraftResult): boolean {
  return (
    estimate.subtotal !== saved.subtotal ||
    estimate.tax_total !== saved.taxTotal ||
    estimate.total !== saved.total ||
    estimate.cgst !== saved.cgst ||
    estimate.sgst !== saved.sgst ||
    estimate.igst !== saved.igst ||
    estimate.round_off !== saved.roundOff
  );
}
