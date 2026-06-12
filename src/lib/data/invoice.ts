import "server-only";

import { createClient } from "@/lib/supabase/server";
import logger from "@/lib/logger";

export interface DraftInvoiceData {
  invoiceId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  notes: string | null;
  isoDate: string;
  dueIsoDate: string | null;
  items: Array<{
    name: string;
    hsn_sac: string | null;
    qty: number;
    unit_price: number;
    discount: number;
    gst_rate: number;
  }>;
  subtotal: number;
  taxTotal: number;
  total: number;
}

/**
 * Loads a draft invoice by id for the edit form round-trip.
 *
 * Returns null when the invoice does not exist, is not a draft, or the caller
 * is not a member of the owning business (RLS enforces the latter silently —
 * the row simply won't be returned).
 *
 * Server-only: never import this in a Client Component.
 */
export async function getDraftInvoice(invoiceId: string): Promise<DraftInvoiceData | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invoices")
    .select(
      `
      id,
      status,
      issue_date,
      due_date,
      notes,
      subtotal,
      tax_total,
      total,
      customer_id,
      customers ( id, name, phone ),
      invoice_line_items (
        position,
        name,
        hsn_sac,
        qty,
        unit_price,
        discount,
        gst_rate
      )
    `,
    )
    .eq("id", invoiceId)
    .eq("status", "draft")
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      logger.error({ err: { code: error.code } }, "getDraftInvoice: query failed");
    }
    return null;
  }

  if (!data || !data.customer_id) return null;

  const customer = Array.isArray(data.customers) ? data.customers[0] : data.customers;
  if (!customer) return null;

  const lineItems = (data.invoice_line_items ?? []).sort((a, b) => a.position - b.position);

  return {
    invoiceId: data.id,
    customerId: data.customer_id,
    customerName: customer.name,
    customerPhone: customer.phone ?? "",
    notes: data.notes,
    isoDate: data.issue_date,
    dueIsoDate: data.due_date,
    items: lineItems.map((it) => ({
      name: it.name,
      hsn_sac: it.hsn_sac,
      qty: it.qty,
      unit_price: it.unit_price,
      discount: it.discount,
      gst_rate: it.gst_rate,
    })),
    subtotal: data.subtotal,
    taxTotal: data.tax_total,
    total: data.total,
  };
}
