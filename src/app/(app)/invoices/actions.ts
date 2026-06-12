"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { SaveInvoiceDraftSchema } from "@/lib/schema/invoice";
import { RecordPaymentSchema } from "@/lib/schema/payment";
import {
  MarkInvoicePaidSchema,
  CancelInvoiceSchema,
  DuplicateInvoiceSchema,
  DeleteInvoiceSchema,
} from "@/lib/schema/lifecycle";
import { computeTotals } from "@/lib/invoice/compute-totals";
import logger from "@/lib/logger";
import { serverEnv, isWhatsAppConfigured } from "@/lib/env.server";
import { sendWhatsAppInvoice } from "@/lib/whatsapp/send";
import type { SaveDraftResult } from "@/lib/types/invoice";
import type { RecordPaymentResult, RecordPaymentRow } from "@/lib/types/payment";
import type {
  MarkInvoicePaidResult,
  MarkInvoicePaidRow,
  CancelInvoiceResult,
  CancelInvoiceRow,
  DuplicateInvoiceResult,
  DuplicateInvoiceRow,
  DeleteInvoiceResult,
  DeleteInvoiceRow,
} from "@/lib/types/lifecycle";
import type { SendInvoiceResult } from "@/lib/types/send";

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

// ── issueInvoice ─────────────────────────────────────────────────────────────

export type IssueInvoiceResult =
  | { ok: true; data: { invoiceId: string; number: string; status: string } }
  | { ok: false; error: string };

const IssueInvoiceInputSchema = z.object({
  invoiceId: z.string().uuid("Invalid invoice ID"),
});

interface IssueInvoiceRow {
  invoice_id: string;
  number: string;
  status: string;
}

/**
 * issueInvoice — AP-16 Unit 2 Server Action.
 *
 * Transitions a draft invoice to 'sent' and assigns the next sequential
 * invoice number in one atomic RPC call. Number assignment is permanent:
 * the gap-free guarantee is enforced in the RPC (see issue_invoice migration).
 * Re-issuing an already-issued invoice is rejected before any sequence draw.
 */
export async function issueInvoice(invoiceId: unknown): Promise<IssueInvoiceResult> {
  const parsed = IssueInvoiceInputSchema.safeParse({ invoiceId });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid invoice ID" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const businessId = await getBusinessId(supabase, user.id);
  if (!businessId) {
    return { ok: false, error: "No business found for this account" };
  }

  const { data, error } = await supabase.rpc("issue_invoice", {
    p_business_id: businessId,
    p_invoice_id: parsed.data.invoiceId,
  });

  if (error) {
    logger.error({ err: { code: error.code } }, "issueInvoice: RPC failed");
    const msg: string = typeof error.message === "string" ? error.message : "";
    if (msg.includes("not a member")) {
      return { ok: false, error: "You are not a member of this business" };
    }
    if (msg.includes("not a draft") || msg.includes("already issued")) {
      return { ok: false, error: "This invoice has already been issued" };
    }
    if (msg.includes("not found")) {
      return { ok: false, error: "Invoice not found" };
    }
    return { ok: false, error: "Failed to issue invoice. Please try again." };
  }

  const row = data as unknown as IssueInvoiceRow;

  return {
    ok: true,
    data: {
      invoiceId: row.invoice_id,
      number: row.number,
      status: row.status,
    },
  };
}

// ── recordPayment ─────────────────────────────────────────────────────────────

function mapRecordPaymentError(message: unknown): string {
  const msg: string = typeof message === "string" ? message : "";
  if (msg.includes("not a member")) return "You are not a member of this business";
  if (msg.includes("invoice not found")) return "Invoice not found";
  if (msg.includes("already paid")) return "This invoice has already been paid";
  if (msg.includes("not payable"))
    return "This invoice cannot accept payments in its current state";
  if (msg.includes("overpayment") || msg.includes("exceed"))
    return "Payment would exceed the invoice total";
  if (msg.includes("greater than zero")) return "Payment amount must be greater than zero";
  return "Failed to record payment. Please try again.";
}

/**
 * recordPayment — AP-18 Server Action.
 *
 * Records a single payment against an invoice and atomically recomputes
 * amount_paid and status via the record_payment RPC. Partial payments set
 * status to 'partial'; a payment that brings amount_paid >= total sets status
 * to 'paid' and stamps paid_at. Overpayment (sum > total) is hard-rejected.
 *
 * businessId is looked up server-side from the caller's session membership —
 * clients never supply it directly, preventing cross-tenant spoofing.
 */
export async function recordPayment(payload: unknown): Promise<RecordPaymentResult> {
  const parsed = RecordPaymentSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid payment data",
    };
  }

  const { invoiceId, amount, method, reference, note } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const businessId = await getBusinessId(supabase, user.id);
  if (!businessId) {
    return { ok: false, error: "No business found for this account" };
  }

  const { data, error } = await supabase.rpc("record_payment", {
    p_business_id: businessId,
    p_invoice_id: invoiceId,
    p_amount: amount,
    p_method: method,
    p_reference: reference,
    p_note: note,
  });

  if (error) {
    logger.error({ err: { code: error.code } }, "recordPayment: RPC failed");
    return { ok: false, error: mapRecordPaymentError(error.message) };
  }

  const row = data as unknown as RecordPaymentRow;

  return {
    ok: true,
    data: {
      invoiceId: row.invoice_id,
      amountPaid: row.amount_paid,
      status: row.status,
      paidAt: row.paid_at,
    },
  };
}

// ── markInvoicePaid ──────────────────────────────────────────────────────────

function mapMarkInvoicePaidError(message: unknown): string {
  const msg: string = typeof message === "string" ? message : "";
  if (msg.includes("not a member")) return "You are not a member of this business";
  if (msg.includes("invoice not found")) return "Invoice not found";
  if (msg.includes("already paid")) return "This invoice has already been paid";
  if (msg.includes("not payable")) return "This invoice cannot be paid in its current state";
  return "Failed to mark invoice as paid. Please try again.";
}

/**
 * markInvoicePaid — AP-19 Unit 1 Server Action.
 *
 * Settles an invoice fully by inserting one payment row for the outstanding
 * amount (total minus sum of existing payments) and transitioning status to
 * 'paid'. Uses the mark_invoice_paid RPC which locks the invoice row FOR UPDATE
 * to prevent concurrent over-collection.
 *
 * businessId is looked up server-side from the caller's session membership.
 */
export async function markInvoicePaid(payload: unknown): Promise<MarkInvoicePaidResult> {
  const parsed = MarkInvoicePaidSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid invoice data",
    };
  }

  const { invoiceId, method } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const businessId = await getBusinessId(supabase, user.id);
  if (!businessId) {
    return { ok: false, error: "No business found for this account" };
  }

  const { data, error } = await supabase.rpc("mark_invoice_paid", {
    p_business_id: businessId,
    p_invoice_id: invoiceId,
    p_method: method,
  });

  if (error) {
    logger.error({ err: { code: error.code } }, "markInvoicePaid: RPC failed");
    return { ok: false, error: mapMarkInvoicePaidError(error.message) };
  }

  const row = data as unknown as MarkInvoicePaidRow;

  return {
    ok: true,
    data: {
      invoiceId: row.invoice_id,
      amountPaid: row.amount_paid,
      status: row.status,
      paidAt: row.paid_at,
    },
  };
}

// ── cancelInvoice ─────────────────────────────────────────────────────────────

function mapCancelInvoiceError(message: unknown): string {
  const msg: string = typeof message === "string" ? message : "";
  if (msg.includes("not a member")) return "You are not a member of this business";
  if (msg.includes("invoice not found")) return "Invoice not found";
  if (msg.includes("cannot cancel a draft"))
    return "Drafts cannot be cancelled — delete them instead";
  if (msg.includes("cannot cancel a paid")) return "Paid invoices cannot be cancelled";
  if (msg.includes("already cancelled")) return "This invoice has already been cancelled";
  return "Failed to cancel invoice. Please try again.";
}

/**
 * cancelInvoice — AP-19 Unit 1 Server Action.
 *
 * Transitions a sent/viewed/partial/overdue/pending invoice to 'cancelled'.
 * Does not affect amount_paid or payments (cancel is not a refund). Uses the
 * cancel_invoice RPC which locks the invoice row FOR UPDATE to prevent races
 * with concurrent status transitions.
 *
 * businessId is looked up server-side from the caller's session membership.
 */
export async function cancelInvoice(payload: unknown): Promise<CancelInvoiceResult> {
  const parsed = CancelInvoiceSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid invoice ID",
    };
  }

  const { invoiceId } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const businessId = await getBusinessId(supabase, user.id);
  if (!businessId) {
    return { ok: false, error: "No business found for this account" };
  }

  const { data, error } = await supabase.rpc("cancel_invoice", {
    p_business_id: businessId,
    p_invoice_id: invoiceId,
  });

  if (error) {
    logger.error({ err: { code: error.code } }, "cancelInvoice: RPC failed");
    return { ok: false, error: mapCancelInvoiceError(error.message) };
  }

  const row = data as unknown as CancelInvoiceRow;

  return {
    ok: true,
    data: {
      invoiceId: row.invoice_id,
      status: row.status,
    },
  };
}

// ── duplicateInvoice ──────────────────────────────────────────────────────────

function mapDuplicateInvoiceError(message: unknown): string {
  const msg: string = typeof message === "string" ? message : "";
  if (msg.includes("not a member")) return "You are not a member of this business";
  if (msg.includes("invoice not found")) return "Invoice not found";
  return "Failed to duplicate invoice. Please try again.";
}

/**
 * duplicateInvoice — AP-19 Unit 2 Server Action.
 *
 * Clones any invoice (any status) into a fresh draft. All line items are copied
 * verbatim with their computed amounts; header lifecycle fields (number, status,
 * amount_paid, paid_at, sent_at, viewed_at, public_token, pdf_url, due_date) are
 * reset to draft defaults. Payments and invoice_events are NOT copied.
 *
 * businessId is looked up server-side from the caller's session membership.
 */
export async function duplicateInvoice(payload: unknown): Promise<DuplicateInvoiceResult> {
  const parsed = DuplicateInvoiceSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid invoice ID",
    };
  }

  const { invoiceId } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const businessId = await getBusinessId(supabase, user.id);
  if (!businessId) {
    return { ok: false, error: "No business found for this account" };
  }

  const { data, error } = await supabase.rpc("duplicate_invoice", {
    p_business_id: businessId,
    p_invoice_id: invoiceId,
  });

  if (error) {
    logger.error({ err: { code: error.code } }, "duplicateInvoice: RPC failed");
    return { ok: false, error: mapDuplicateInvoiceError(error.message) };
  }

  const row = data as unknown as DuplicateInvoiceRow;

  return {
    ok: true,
    data: {
      invoiceId: row.invoice_id,
      status: row.status,
    },
  };
}

// ── deleteInvoice ─────────────────────────────────────────────────────────────

function mapDeleteInvoiceError(message: unknown): string {
  const msg: string = typeof message === "string" ? message : "";
  if (msg.includes("not a member")) return "You are not a member of this business";
  if (msg.includes("invoice not found")) return "Invoice not found";
  if (msg.includes("cannot delete a non-draft"))
    return "Only draft invoices can be deleted — cancel issued invoices instead";
  return "Failed to delete invoice. Please try again.";
}

/**
 * deleteInvoice — AP-19 Unit 2 Server Action.
 *
 * Hard-deletes a DRAFT invoice and all its line items. Issued invoices are a
 * permanent legal/audit record and must be cancelled, not deleted — the RPC
 * enforces this with a status guard that raises for any non-draft status.
 *
 * businessId is looked up server-side from the caller's session membership.
 */
export async function deleteInvoice(payload: unknown): Promise<DeleteInvoiceResult> {
  const parsed = DeleteInvoiceSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid invoice ID",
    };
  }

  const { invoiceId } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const businessId = await getBusinessId(supabase, user.id);
  if (!businessId) {
    return { ok: false, error: "No business found for this account" };
  }

  const { data, error } = await supabase.rpc("delete_invoice", {
    p_business_id: businessId,
    p_invoice_id: invoiceId,
  });

  if (error) {
    logger.error({ err: { code: error.code } }, "deleteInvoice: RPC failed");
    return { ok: false, error: mapDeleteInvoiceError(error.message) };
  }

  const row = data as unknown as DeleteInvoiceRow;

  return {
    ok: true,
    data: {
      invoiceId: row.invoice_id,
      deleted: row.deleted,
    },
  };
}

// ── sendInvoice ───────────────────────────────────────────────────────────────

const SendInvoiceInputSchema = z.object({
  invoiceId: z.string().uuid("Invalid invoice ID"),
});

interface InvoiceForSend {
  id: string;
  number: string | null;
  public_token: string | null;
  total: number;
  amount_paid: number;
  customer_id: string | null;
  customers: { phone: string | null } | null;
}

interface DispatchWriteParams {
  supabase: Awaited<ReturnType<typeof createClient>>;
  businessId: string;
  invoiceId: string;
  outcome: "sent" | "failed" | "skipped";
  providerMsgId: string | null;
  logError: string | null;
}

/**
 * Writes a message_log row + invoice_events row for a WhatsApp dispatch
 * attempt. Called for every outcome (sent / failed / skipped) so the log
 * is complete regardless of whether a live API call was made.
 *
 * Returns the created message_log id, or an empty string when the insert fails
 * (the outer action already logs the insert error).
 */
async function writeDispatchLog(params: DispatchWriteParams): Promise<string> {
  const { supabase, businessId, invoiceId, outcome, providerMsgId, logError } = params;

  const { data: logRow, error: logErr } = await supabase
    .from("message_log")
    .insert({
      business_id: businessId,
      invoice_id: invoiceId,
      channel: "whatsapp",
      status: outcome,
      provider_msg_id: providerMsgId,
      error: logError,
    })
    .select("id")
    .single();

  if (logErr) {
    logger.error({ err: { code: logErr.code } }, "sendInvoice: message_log insert failed");
  }

  const { error: eventErr } = await supabase.from("invoice_events").insert({
    business_id: businessId,
    invoice_id: invoiceId,
    type: "whatsapp.dispatched",
    channel: "whatsapp",
    meta: { outcome, provider_msg_id: providerMsgId },
  });

  if (eventErr) {
    logger.error({ err: { code: eventErr.code } }, "sendInvoice: invoice_events insert failed");
  }

  return logRow?.id ?? "";
}

/**
 * sendInvoice — AP-25 Server Action (WhatsApp Cloud API dispatch).
 *
 * Sends a pay-link WhatsApp message to the invoice's customer. Dispatch is
 * logged to message_log and invoice_events regardless of outcome.
 *
 * Binding decisions:
 * - DOES NOT touch invoices.status or invoices.sent_at (owned by issue_invoice).
 * - ENV-GATED: when WhatsApp credentials are absent the live POST is skipped;
 *   a 'skipped' message_log row is written and { ok:true, data:{ skipped:true } }
 *   is returned — this is the expected dev/CI path today.
 * - Requires public_token to be set (invoice must have been issued first).
 * - Template is pay-link only (no PDF — deferred to Epic 8).
 */
export async function sendInvoice(invoiceId: unknown): Promise<SendInvoiceResult> {
  const parsed = SendInvoiceInputSchema.safeParse({ invoiceId });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid invoice ID" };
  }

  const uuid = parsed.data.invoiceId;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const businessId = await getBusinessId(supabase, user.id);
  if (!businessId) {
    return { ok: false, error: "No business found for this account" };
  }

  const { data: invoiceRow, error: invoiceErr } = await supabase
    .from("invoices")
    .select("id, number, public_token, total, amount_paid, customer_id, customers(phone)")
    .eq("id", uuid)
    .eq("business_id", businessId)
    .single();

  if (invoiceErr || !invoiceRow) {
    if (invoiceErr && invoiceErr.code !== "PGRST116") {
      logger.error({ err: { code: invoiceErr.code } }, "sendInvoice: invoice fetch failed");
    }
    return { ok: false, error: "Invoice not found" };
  }

  const invoice = invoiceRow as unknown as InvoiceForSend;

  if (!invoice.public_token) {
    return { ok: false, error: "Invoice has not been issued yet — issue it before sending" };
  }

  const customer = Array.isArray(invoice.customers) ? invoice.customers[0] : invoice.customers;
  const phone = customer?.phone ?? null;

  if (!phone) {
    return { ok: false, error: "Customer has no phone number on file" };
  }

  /*
   * Build the absolute pay URL. Prefer NEXT_PUBLIC_APP_URL (the deployed app
   * origin, e.g. https://app.arthapatra.in). Falls back to NEXT_PUBLIC_SUPABASE_URL
   * in local dev — set NEXT_PUBLIC_APP_URL in .env.local for a correct pay link
   * during manual testing (the fallback URL points at Supabase, not the dev server).
   */
  const appBase = serverEnv.NEXT_PUBLIC_APP_URL ?? serverEnv.NEXT_PUBLIC_SUPABASE_URL;
  const payUrl = `${appBase}/pay/${invoice.public_token}`;
  const invoiceNumber = invoice.number ?? uuid;

  // ── ENV GATE ──────────────────────────────────────────────────────────────
  //
  // Skip the live Cloud API call when WABA credentials are not yet provisioned.
  // This is the expected path in dev/CI today (AP-4 precedent). The 'skipped'
  // log row lets operators see dispatch attempts; the non-alarming ok:true result
  // lets the UI show a "WhatsApp not configured" notice without treating it as
  // an error.
  if (!isWhatsAppConfigured()) {
    logger.info({ invoiceId: uuid }, "sendInvoice: WhatsApp not configured — skipping dispatch");

    const messageLogId = await writeDispatchLog({
      supabase,
      businessId,
      invoiceId: uuid,
      outcome: "skipped",
      providerMsgId: null,
      logError: "WhatsApp not configured",
    });

    return {
      ok: true,
      data: { invoiceId: uuid, messageLogId, outcome: "skipped", skipped: true },
    };
  }

  // ── Live dispatch via WhatsApp Cloud API ──────────────────────────────────

  const sendResult = await sendWhatsAppInvoice({ recipientPhone: phone, invoiceNumber, payUrl });

  const outcome = sendResult.ok ? "sent" : "failed";
  const providerMsgId = sendResult.ok ? sendResult.providerMsgId : null;
  const logError = sendResult.ok ? null : sendResult.error;

  const messageLogId = await writeDispatchLog({
    supabase,
    businessId,
    invoiceId: uuid,
    outcome,
    providerMsgId,
    logError,
  });

  if (!sendResult.ok) {
    return { ok: false, error: `WhatsApp send failed: ${sendResult.error}` };
  }

  return { ok: true, data: { invoiceId: uuid, messageLogId, outcome: "sent" } };
}
