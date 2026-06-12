import { computeTotals } from "@/lib/invoice/compute-totals";
import type { DraftFormData } from "@/lib/schema/invoice";

/**
 * Running estimate for the create/edit forms. Paise ↔ rupee boundary:
 * watched items carry integer paise; computeTotals operates in paise;
 * preview components divide by 100 for display.
 */
export function estimateDraftTotals(items: DraftFormData["items"]) {
  return computeTotals(
    items.map((it) => ({
      name: it.name ?? "",
      qty: it.qty ?? 0,
      unit_price: it.unit_price ?? 0,
      discount: it.discount ?? 0,
      gst_rate: it.gst_rate ?? 0,
    })),
  );
}

export function toDraftSavePayload(customerId: string, data: DraftFormData, invoiceId?: string) {
  return {
    customerId,
    invoiceId,
    items: data.items.map((it) => ({
      name: it.name,
      hsn_sac: it.hsn_sac || undefined,
      qty: it.qty,
      unit_price: it.unit_price,
      discount: it.discount,
      gst_rate: it.gst_rate,
    })),
    notes: data.notes || undefined,
  };
}
