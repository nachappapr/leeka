"use server";

import { createClient } from "@/lib/supabase/server";
import { SaveInvoiceDraftSchema } from "@/lib/schema/invoice";
import { computeTotals } from "@/lib/invoice/compute-totals";
import logger from "@/lib/logger";
import type { SaveDraftResult } from "@/lib/types/invoice";

export type SaveInvoiceDraftResult =
  | { ok: true; data: SaveDraftResult }
  | { ok: false; error: string };

async function getBusinessId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<string | null> {
  const { data: member } = await supabase
    .from("business_members")
    .select("business_id")
    .eq("user_id", userId)
    .single();
  return member?.business_id ?? null;
}

interface SaveInvoiceDraftRow {
  invoice_id: string;
  status: "draft";
  subtotal: number;
  tax_total: number;
  total: number;
  cgst: number;
  sgst: number;
  igst: number;
  round_off: number;
  is_interstate: boolean;
  gst_enabled: boolean;
  line_items: Array<{
    position: number;
    name: string;
    hsn_sac: string | null;
    qty: number;
    unit_price: number;
    discount: number;
    gst_rate: number;
    line_subtotal: number;
    line_tax: number;
    line_total: number;
    cgst: number;
    sgst: number;
    igst: number;
  }>;
}

/**
 * saveInvoiceDraft — AP-13/AP-14 Server Action.
 *
 * Validates, recomputes totals server-side (never trusts client totals),
 * and calls the save_invoice_draft RPC to INSERT (new draft) or UPDATE
 * (existing draft). Returns the saved invoice id + computed totals including
 * the GST split for the preview panel.
 *
 * Trust boundary: totals and GST split are computed here from the validated
 * payload, then passed to the RPC. The action is the single source of truth
 * for totals; the RPC stores what it receives. A client cannot supply totals.
 *
 * AP-14: gstEnabled is sourced from businesses.gst_enabled; isInterstate is
 * derived by comparing the business state_code against the customer state_code.
 * Both flags are read server-side after the membership guard — no client input
 * is trusted for either flag.
 */
export async function saveInvoiceDraft(payload: unknown): Promise<SaveInvoiceDraftResult> {
  const parsed = SaveInvoiceDraftSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid invoice data",
    };
  }

  const { customerId, invoiceId, items, notes } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  // Business membership guard — also enforced in RPC (defence in depth).
  const businessId = await getBusinessId(supabase, user.id);
  if (!businessId) {
    return { ok: false, error: "No business found for this account" };
  }

  const { data: businessRow, error: businessErr } = await supabase
    .from("businesses")
    .select("gst_enabled, state_code")
    .eq("id", businessId)
    .single();

  if (businessErr || !businessRow) {
    logger.error(
      { err: { code: businessErr?.code } },
      "saveInvoiceDraft: failed to fetch business flags",
    );
    return { ok: false, error: "Failed to load business settings. Please try again." };
  }

  const { data: customerRow, error: customerErr } = await supabase
    .from("customers")
    .select("state_code")
    .eq("id", customerId)
    .single();

  if (customerErr || !customerRow) {
    logger.error(
      { err: { code: customerErr?.code } },
      "saveInvoiceDraft: failed to fetch customer state",
    );
    return { ok: false, error: "Failed to load customer details. Please try again." };
  }

  const gstEnabled = businessRow.gst_enabled;

  // Default isInterstate=false when either state_code is absent.
  // Defaulting to IGST (isInterstate=true) on unknown geography would mis-split
  // tax into IGST when the transaction may be intra-state; CGST/SGST is the
  // conservative safe default — it does not block the save.
  const isInterstate =
    Boolean(businessRow.state_code) &&
    Boolean(customerRow.state_code) &&
    businessRow.state_code !== customerRow.state_code;

  const totals = computeTotals(items, { gstEnabled, isInterstate });

  const lineItemsPayload = items.map((item, idx) => {
    const computed = totals.lines[idx];
    return {
      position: idx,
      name: item.name,
      hsn_sac: item.hsn_sac ?? null,
      qty: item.qty,
      unit_price: item.unit_price,
      discount: item.discount,
      gst_rate: item.gst_rate,
      line_subtotal: computed.line_subtotal,
      line_tax: computed.line_tax,
      line_total: computed.line_total,
      cgst: computed.cgst,
      sgst: computed.sgst,
      igst: computed.igst,
    };
  });

  const { data, error } = await supabase.rpc("save_invoice_draft", {
    p_business_id: businessId,
    p_invoice_id: invoiceId ?? undefined,
    p_customer_id: customerId,
    p_notes: notes ?? undefined,
    p_subtotal: totals.subtotal,
    p_tax_total: totals.tax_total,
    p_total: totals.total,
    p_line_items: lineItemsPayload,
    p_cgst: totals.cgst,
    p_sgst: totals.sgst,
    p_igst: totals.igst,
    p_round_off: totals.round_off,
    p_is_interstate: isInterstate,
    p_gst_enabled: gstEnabled,
  });

  if (error) {
    logger.error({ err: { code: error.code } }, "saveInvoiceDraft: RPC failed");
    const msg: string = typeof error.message === "string" ? error.message : "";
    if (msg.includes("not a member")) {
      return { ok: false, error: "You are not a member of this business" };
    }
    if (msg.includes("not a draft")) {
      return { ok: false, error: "This invoice cannot be edited (not a draft)" };
    }
    if (msg.includes("not found")) {
      return { ok: false, error: "Invoice not found" };
    }
    return { ok: false, error: "Failed to save invoice draft. Please try again." };
  }

  const row = data as unknown as SaveInvoiceDraftRow;

  return {
    ok: true,
    data: {
      invoiceId: row.invoice_id,
      status: row.status,
      subtotal: row.subtotal,
      taxTotal: row.tax_total,
      total: row.total,
      cgst: row.cgst,
      sgst: row.sgst,
      igst: row.igst,
      roundOff: row.round_off,
      isInterstate: row.is_interstate,
      gstEnabled: row.gst_enabled,
      lines: row.line_items.map((l) => ({
        position: l.position,
        name: l.name,
        hsn_sac: l.hsn_sac,
        qty: l.qty,
        unit_price: l.unit_price,
        discount: l.discount,
        gst_rate: l.gst_rate,
        line_subtotal: l.line_subtotal,
        line_tax: l.line_tax,
        line_total: l.line_total,
        cgst: l.cgst,
        sgst: l.sgst,
        igst: l.igst,
      })),
    },
  };
}
