"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { SaveInvoiceDraftSchema, SavedDraftLineReturnSchema } from "@/lib/schema/invoice";
import { revalidateBusiness } from "@/lib/cache/revalidate-business";
import { RecordPaymentSchema } from "@/lib/schema/payment";
import {
  MarkInvoicePaidSchema,
  MarkInvoiceUnpaidSchema,
  CancelInvoiceSchema,
  DuplicateInvoiceSchema,
  DeleteInvoiceSchema,
} from "@/lib/schema/lifecycle";
import { FetchInvoicesPageStatusSchema, FetchInvoicesPageCursorSchema } from "@/lib/schema/invoice";
import { computeTotals } from "@/lib/invoice/compute-totals";
import logger from "@/lib/logger";
import {
  serverEnv,
  isWhatsAppConfigured,
  isEmailConfigured,
  isWhatsAppReceiptConfigured,
} from "@/lib/env.server";
import { sendWhatsAppInvoice, sendWhatsAppReceipt } from "@/lib/whatsapp/send";
import { formatPaise } from "@/lib/utils/format-currency";
import { sendEmailInvoice } from "@/lib/email/send";
import {
  listInvoicesPage,
  getInvoiceStatusCounts,
  resolveBusinessId as resolveId,
} from "@/lib/data/invoice";
import type { SaveDraftResult } from "@/lib/types/invoice";
import type { RecordPaymentResult } from "@/lib/types/payment";
import type {
  MarkInvoicePaidResult,
  MarkInvoiceUnpaidResult,
  CancelInvoiceResult,
  DuplicateInvoiceResult,
  DeleteInvoiceResult,
} from "@/lib/types/lifecycle";
import type {
  SendInvoiceResult,
  SendInvoiceEmailResult,
  SendReminderResult,
  SendReceiptResult,
} from "@/lib/types/send";
import type {
  InvoicePage,
  InvoicePageCursor,
  InvoiceStatusCounts,
  InvoiceStatusFilter,
} from "@/lib/types/invoice";

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

function mapSaveDraftError(message: unknown): string {
  const msg: string = typeof message === "string" ? message : "";
  if (msg.includes("not a member")) return "You are not a member of this business";
  if (msg.includes("not a draft")) return "This invoice cannot be edited (not a draft)";
  if (msg.includes("not found")) return "Invoice not found";
  return "Failed to save invoice draft. Please try again.";
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

  const { data, error } = await supabase
    .rpc("save_invoice_draft", {
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
    })
    .single();

  if (error) {
    logger.error({ err: { code: error.code } }, "saveInvoiceDraft: RPC failed");
    return { ok: false, error: mapSaveDraftError(error.message) };
  }

  revalidateBusiness(businessId);

  if (data.status !== "draft") {
    logger.error({ status: data.status }, "saveInvoiceDraft: RPC returned non-draft status");
    return { ok: false, error: "Failed to save draft. Please try again." };
  }

  // line_items is a jsonb column; validate its shape with Zod to avoid any cast.
  const linesResult = SavedDraftLineReturnSchema.array().safeParse(data.line_items);
  if (!linesResult.success) {
    logger.error(
      { err: { message: linesResult.error.message } },
      "saveInvoiceDraft: line_items parse failed",
    );
    return { ok: false, error: "Failed to parse invoice lines. Please try again." };
  }

  return {
    ok: true,
    data: {
      invoiceId: data.invoice_id,
      status: data.status,
      subtotal: data.subtotal,
      taxTotal: data.tax_total,
      total: data.total,
      cgst: data.cgst,
      sgst: data.sgst,
      igst: data.igst,
      roundOff: data.round_off,
      isInterstate: data.is_interstate,
      gstEnabled: data.gst_enabled,
      lines: linesResult.data.map((l) => ({
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

  const { data, error } = await supabase
    .rpc("issue_invoice", {
      p_business_id: businessId,
      p_invoice_id: parsed.data.invoiceId,
    })
    .single();

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
    if (msg.includes("free plan invoice cap reached")) {
      return {
        ok: false,
        error:
          "You've reached your free plan limit of 5 invoices this month. Upgrade to Pro for unlimited invoices.",
      };
    }
    return { ok: false, error: "Failed to issue invoice. Please try again." };
  }

  revalidateBusiness(businessId);

  return {
    ok: true,
    data: {
      invoiceId: data.invoice_id,
      number: data.number,
      status: data.status,
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

  const { data, error } = await supabase
    .rpc("record_payment", {
      p_business_id: businessId,
      p_invoice_id: invoiceId,
      p_amount: amount,
      p_method: method,
      p_reference: reference,
      p_note: note,
    })
    .single();

  if (error) {
    logger.error({ err: { code: error.code } }, "recordPayment: RPC failed");
    return { ok: false, error: mapRecordPaymentError(error.message) };
  }

  revalidateBusiness(businessId);

  return {
    ok: true,
    data: {
      invoiceId: data.invoice_id,
      amountPaid: data.amount_paid,
      status: data.status,
      // The type generator emits string for paid_at but the function can return
      // null (partial payment). Widening to string | null matches RecordPaymentData.
      paidAt: data.paid_at,
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

  const { data, error } = await supabase
    .rpc("mark_invoice_paid", {
      p_business_id: businessId,
      p_invoice_id: invoiceId,
      p_method: method,
    })
    .single();

  if (error) {
    logger.error({ err: { code: error.code } }, "markInvoicePaid: RPC failed");
    return { ok: false, error: mapMarkInvoicePaidError(error.message) };
  }

  revalidateBusiness(businessId);

  return {
    ok: true,
    data: {
      invoiceId: data.invoice_id,
      amountPaid: data.amount_paid,
      status: data.status,
      paidAt: data.paid_at,
    },
  };
}

// ── markInvoiceUnpaid ─────────────────────────────────────────────────────────

function mapMarkInvoiceUnpaidError(message: unknown): string {
  const msg: string = typeof message === "string" ? message : "";
  if (msg.includes("not a member")) return "You are not a member of this business";
  if (msg.includes("invoice not found")) return "Invoice not found";
  if (msg.includes("not paid")) return "This invoice is not marked as paid";
  if (msg.includes("gateway payment"))
    return "This payment was confirmed by a gateway and cannot be undone from the app";
  return "Failed to mark invoice as unpaid. Please try again.";
}

/**
 * markInvoiceUnpaid — issue #18 Server Action.
 *
 * Reverses a manually-recorded payment: deletes the manual payment row(s),
 * zeroes amount_paid/paid_at, and rejoins the lifecycle at the status reality
 * dictates (overdue / viewed / sent) — recomputed by the RPC, never restored
 * from a stored prior status. The mark_invoice_unpaid RPC is the security and
 * manual-only boundary (rejects non-paid status and any gateway payment under a
 * FOR UPDATE lock); the disabled button is UX only.
 *
 * businessId is looked up server-side from the caller's session membership.
 */
export async function markInvoiceUnpaid(payload: unknown): Promise<MarkInvoiceUnpaidResult> {
  const parsed = MarkInvoiceUnpaidSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid invoice data",
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

  const { data, error } = await supabase
    .rpc("mark_invoice_unpaid", {
      p_business_id: businessId,
      p_invoice_id: invoiceId,
    })
    .single();

  if (error) {
    logger.error({ err: { code: error.code } }, "markInvoiceUnpaid: RPC failed");
    return { ok: false, error: mapMarkInvoiceUnpaidError(error.message) };
  }

  revalidateBusiness(businessId);

  return {
    ok: true,
    data: {
      invoiceId: data.invoice_id,
      status: data.status,
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

  const { data, error } = await supabase
    .rpc("cancel_invoice", {
      p_business_id: businessId,
      p_invoice_id: invoiceId,
    })
    .single();

  if (error) {
    logger.error({ err: { code: error.code } }, "cancelInvoice: RPC failed");
    return { ok: false, error: mapCancelInvoiceError(error.message) };
  }

  revalidateBusiness(businessId);

  return {
    ok: true,
    data: {
      invoiceId: data.invoice_id,
      status: data.status,
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

  const { data, error } = await supabase
    .rpc("duplicate_invoice", {
      p_business_id: businessId,
      p_invoice_id: invoiceId,
    })
    .single();

  if (error) {
    logger.error({ err: { code: error.code } }, "duplicateInvoice: RPC failed");
    return { ok: false, error: mapDuplicateInvoiceError(error.message) };
  }

  revalidateBusiness(businessId);

  return {
    ok: true,
    data: {
      invoiceId: data.invoice_id,
      status: data.status,
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

  const { data, error } = await supabase
    .rpc("delete_invoice", {
      p_business_id: businessId,
      p_invoice_id: invoiceId,
    })
    .single();

  if (error) {
    logger.error({ err: { code: error.code } }, "deleteInvoice: RPC failed");
    return { ok: false, error: mapDeleteInvoiceError(error.message) };
  }

  revalidateBusiness(businessId);

  return {
    ok: true,
    data: {
      invoiceId: data.invoice_id,
      deleted: data.deleted,
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
  customers: { phone: string | null; email: string | null; name: string } | null;
}

interface DispatchWriteParams {
  supabase: Awaited<ReturnType<typeof createClient>>;
  businessId: string;
  invoiceId: string;
  channel: "whatsapp" | "email";
  outcome: "sent" | "failed" | "skipped";
  providerMsgId: string | null;
  logError: string | null;
  /**
   * Event type written to invoice_events. Defaults to `${channel}.dispatched`
   * for initial send actions. sendReminder passes "reminder_sent" — this is a
   * hard contract with Epic 13's notifications trigger; do not change.
   */
  eventType?: string;
  /**
   * Extra fields merged into the invoice_events.meta JSON. sendReminder passes
   * `{ source: "manual" }` to distinguish manual from future auto reminders.
   */
  eventMeta?: Record<string, unknown>;
}

/**
 * Writes a message_log row + invoice_events row for a dispatch attempt.
 * Called for every outcome (sent / failed / skipped) so the log is complete
 * regardless of whether a live API call was made. Supports both 'whatsapp'
 * and 'email' channels via the channel param.
 *
 * eventType defaults to `${channel}.dispatched` so existing sendInvoice /
 * sendInvoiceEmail callers are byte-for-byte equivalent in effect. Callers
 * that need a different event type (e.g. sendReminder → "reminder_sent") pass
 * it explicitly.
 *
 * Returns the created message_log id, or an empty string when the insert fails
 * (the outer action already logs the insert error).
 */
async function writeDispatchLog(params: DispatchWriteParams): Promise<string> {
  const {
    supabase,
    businessId,
    invoiceId,
    channel,
    outcome,
    providerMsgId,
    logError,
    eventType,
    eventMeta,
  } = params;

  const resolvedEventType = eventType ?? `${channel}.dispatched`;

  const { data: logRow, error: logErr } = await supabase
    .from("message_log")
    .insert({
      business_id: businessId,
      invoice_id: invoiceId,
      channel,
      status: outcome,
      provider_msg_id: providerMsgId,
      error: logError,
    })
    .select("id")
    .single();

  if (logErr) {
    logger.error(
      { err: { code: logErr.code } },
      `${channel === "email" ? "sendInvoiceEmail" : "sendInvoice"}: message_log insert failed`,
    );
  }

  const { error: eventErr } = await supabase.from("invoice_events").insert({
    business_id: businessId,
    invoice_id: invoiceId,
    type: resolvedEventType,
    channel,
    meta: { outcome, provider_msg_id: providerMsgId, ...eventMeta },
  });

  if (eventErr) {
    logger.error(
      { err: { code: eventErr.code } },
      `${channel === "email" ? "sendInvoiceEmail" : "sendInvoice"}: invoice_events insert failed`,
    );
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
    .select(
      "id, number, public_token, total, amount_paid, customer_id, customers(phone, email, name)",
    )
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
      channel: "whatsapp",
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
    channel: "whatsapp",
    outcome,
    providerMsgId,
    logError,
  });

  if (!sendResult.ok) {
    return { ok: false, error: `WhatsApp send failed: ${sendResult.error}` };
  }

  return { ok: true, data: { invoiceId: uuid, messageLogId, outcome: "sent" } };
}

// ── sendInvoiceEmail ──────────────────────────────────────────────────────────

const SendInvoiceEmailInputSchema = z.object({
  invoiceId: z.string().uuid("Invalid invoice ID"),
});

interface InvoiceForEmailSend {
  id: string;
  number: string | null;
  public_token: string | null;
  total: number;
  amount_paid: number;
  customer_id: string | null;
  customers: { email: string | null; name: string } | null;
}

/**
 * sendInvoiceEmail — AP-28 Server Action (Resend email dispatch).
 *
 * Sends a branded pay-link email to the invoice's customer. Dispatch is
 * logged to message_log and invoice_events regardless of outcome.
 *
 * Binding decisions:
 * - DOES NOT touch invoices.status or invoices.sent_at (owned by issue_invoice).
 * - ENV-GATED: when Resend credentials are absent the live POST is skipped;
 *   a 'skipped' message_log row is written and { ok:true, data:{ skipped:true } }
 *   is returned — this is the expected dev/CI path today.
 * - Requires public_token to be set (invoice must have been issued first).
 * - Email carries a pay link only — no PDF (Epic 8 deferred).
 */
export async function sendInvoiceEmail(invoiceId: unknown): Promise<SendInvoiceEmailResult> {
  const parsed = SendInvoiceEmailInputSchema.safeParse({ invoiceId });
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
    .select("id, number, public_token, total, amount_paid, customer_id, customers(email, name)")
    .eq("id", uuid)
    .eq("business_id", businessId)
    .single();

  if (invoiceErr || !invoiceRow) {
    if (invoiceErr && invoiceErr.code !== "PGRST116") {
      logger.error({ err: { code: invoiceErr.code } }, "sendInvoiceEmail: invoice fetch failed");
    }
    return { ok: false, error: "Invoice not found" };
  }

  const invoice = invoiceRow as unknown as InvoiceForEmailSend;

  if (!invoice.public_token) {
    return { ok: false, error: "Invoice has not been issued yet — issue it before sending" };
  }

  const customer = Array.isArray(invoice.customers) ? invoice.customers[0] : invoice.customers;
  const recipientEmail = customer?.email ?? null;

  if (!recipientEmail) {
    return { ok: false, error: "Customer has no email address on file" };
  }

  const customerName = customer?.name ?? "Customer";

  /*
   * Build the absolute pay URL. Prefer NEXT_PUBLIC_APP_URL (the deployed app
   * origin, e.g. https://app.arthapatra.in). Falls back to NEXT_PUBLIC_SUPABASE_URL
   * in local dev — set NEXT_PUBLIC_APP_URL in .env.local for a correct pay link
   * during manual testing.
   */
  const appBase = serverEnv.NEXT_PUBLIC_APP_URL ?? serverEnv.NEXT_PUBLIC_SUPABASE_URL;
  const payUrl = `${appBase}/pay/${invoice.public_token}`;
  const invoiceNumber = invoice.number ?? uuid;

  // ── ENV GATE ──────────────────────────────────────────────────────────────
  //
  // Skip the live Resend call when credentials are not yet provisioned.
  // The 'skipped' log row lets operators see dispatch attempts; the non-alarming
  // ok:true result lets the UI show an "Email not configured" notice without
  // treating it as an error.
  if (!isEmailConfigured()) {
    logger.info({ invoiceId: uuid }, "sendInvoiceEmail: email not configured — skipping dispatch");

    const messageLogId = await writeDispatchLog({
      supabase,
      businessId,
      invoiceId: uuid,
      channel: "email",
      outcome: "skipped",
      providerMsgId: null,
      logError: "Email not configured",
    });

    return {
      ok: true,
      data: { invoiceId: uuid, messageLogId, outcome: "skipped", skipped: true },
    };
  }

  // ── Live dispatch via Resend ──────────────────────────────────────────────

  const sendResult = await sendEmailInvoice({
    recipientEmail,
    invoiceNumber,
    payUrl,
    customerName,
  });

  const outcome = sendResult.ok ? "sent" : "failed";
  const providerMsgId = sendResult.ok ? sendResult.providerMsgId : null;
  const logError = sendResult.ok ? null : sendResult.error;

  const messageLogId = await writeDispatchLog({
    supabase,
    businessId,
    invoiceId: uuid,
    channel: "email",
    outcome,
    providerMsgId,
    logError,
  });

  if (!sendResult.ok) {
    return { ok: false, error: `Email send failed: ${sendResult.error}` };
  }

  return { ok: true, data: { invoiceId: uuid, messageLogId, outcome: "sent" } };
}

// ── sendReminder ──────────────────────────────────────────────────────────────

const SendReminderInputSchema = z.object({
  invoiceId: z.string().uuid("Invalid invoice ID"),
  channel: z.enum(["whatsapp", "email"]),
});

interface InvoiceForReminder {
  id: string;
  number: string | null;
  status: string;
  public_token: string | null;
  total: number;
  amount_paid: number;
  customers: { phone: string | null; email: string | null; name: string } | null;
}

interface ReminderDispatchParams {
  supabase: Awaited<ReturnType<typeof createClient>>;
  businessId: string;
  invoice: InvoiceForReminder;
}

async function dispatchReminderWhatsApp(
  params: ReminderDispatchParams & { phone: string },
): Promise<SendReminderResult> {
  const { supabase, businessId, invoice, phone } = params;
  const invoiceId = invoice.id;
  const appBase = serverEnv.NEXT_PUBLIC_APP_URL ?? serverEnv.NEXT_PUBLIC_SUPABASE_URL;
  const payUrl = `${appBase}/pay/${invoice.public_token!}`;
  const invoiceNumber = invoice.number ?? invoiceId;

  if (!isWhatsAppConfigured()) {
    logger.info({ invoiceId }, "sendReminder: WhatsApp not configured — skipping dispatch");
    const messageLogId = await writeDispatchLog({
      supabase,
      businessId,
      invoiceId,
      channel: "whatsapp",
      outcome: "skipped",
      providerMsgId: null,
      logError: "WhatsApp not configured",
      eventType: "reminder_sent",
      eventMeta: { source: "manual" },
    });
    return { ok: true, data: { invoiceId, messageLogId, outcome: "skipped", skipped: true } };
  }

  const sendResult = await sendWhatsAppInvoice({ recipientPhone: phone, invoiceNumber, payUrl });
  const outcome = sendResult.ok ? "sent" : "failed";
  const providerMsgId = sendResult.ok ? sendResult.providerMsgId : null;
  const logError = sendResult.ok ? null : sendResult.error;

  const messageLogId = await writeDispatchLog({
    supabase,
    businessId,
    invoiceId,
    channel: "whatsapp",
    outcome,
    providerMsgId,
    logError,
    eventType: "reminder_sent",
    eventMeta: { source: "manual" },
  });

  if (!sendResult.ok) {
    return { ok: false, error: `Reminder send failed: ${sendResult.error}` };
  }
  return { ok: true, data: { invoiceId, messageLogId, outcome: "sent" } };
}

async function dispatchReminderEmail(
  params: ReminderDispatchParams & { recipientEmail: string; customerName: string },
): Promise<SendReminderResult> {
  const { supabase, businessId, invoice, recipientEmail, customerName } = params;
  const invoiceId = invoice.id;
  const appBase = serverEnv.NEXT_PUBLIC_APP_URL ?? serverEnv.NEXT_PUBLIC_SUPABASE_URL;
  const payUrl = `${appBase}/pay/${invoice.public_token!}`;
  const invoiceNumber = invoice.number ?? invoiceId;

  if (!isEmailConfigured()) {
    logger.info({ invoiceId }, "sendReminder: email not configured — skipping dispatch");
    const messageLogId = await writeDispatchLog({
      supabase,
      businessId,
      invoiceId,
      channel: "email",
      outcome: "skipped",
      providerMsgId: null,
      logError: "Email not configured",
      eventType: "reminder_sent",
      eventMeta: { source: "manual" },
    });
    return { ok: true, data: { invoiceId, messageLogId, outcome: "skipped", skipped: true } };
  }

  const sendResult = await sendEmailInvoice({
    recipientEmail,
    invoiceNumber,
    payUrl,
    customerName,
  });
  const outcome = sendResult.ok ? "sent" : "failed";
  const providerMsgId = sendResult.ok ? sendResult.providerMsgId : null;
  const logError = sendResult.ok ? null : sendResult.error;

  const messageLogId = await writeDispatchLog({
    supabase,
    businessId,
    invoiceId,
    channel: "email",
    outcome,
    providerMsgId,
    logError,
    eventType: "reminder_sent",
    eventMeta: { source: "manual" },
  });

  if (!sendResult.ok) {
    return { ok: false, error: `Reminder send failed: ${sendResult.error}` };
  }
  return { ok: true, data: { invoiceId, messageLogId, outcome: "sent" } };
}

/**
 * sendReminder — AP-29 Server Action (manual payment reminder dispatch).
 *
 * Dispatches a reminder to the invoice's customer via WhatsApp or email.
 * Uses the same send helpers as sendInvoice / sendInvoiceEmail but writes
 * event type "reminder_sent" instead of "<channel>.dispatched" — this is a
 * hard contract with Epic 13's notifications trigger; never change the type.
 *
 * Binding decisions:
 * - DOES NOT touch invoices.status or any lifecycle field (reminder is read-only
 *   on the invoice row; only message_log and invoice_events are written).
 * - ENV-GATED: when channel credentials are absent the live call is skipped;
 *   a 'skipped' log row is written and { ok:true, data:{ skipped:true } } is
 *   returned — expected dev/CI path until WABA/Resend are provisioned.
 * - Requires public_token (invoice must be issued); guards on paid/cancelled.
 * - No de-duplication of manual reminders — allowed to send multiple.
 * - invoice_events.meta carries { source: "manual" } to distinguish from
 *   future auto reminders (Epic 13 / AP-30 cron).
 */
export async function sendReminder(payload: unknown): Promise<SendReminderResult> {
  const parsed = SendReminderInputSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid reminder payload" };
  }

  const { invoiceId, channel } = parsed.data;

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
    .select("id, number, status, public_token, total, amount_paid, customers(phone, email, name)")
    .eq("id", invoiceId)
    .eq("business_id", businessId)
    .single();

  if (invoiceErr || !invoiceRow) {
    if (invoiceErr && invoiceErr.code !== "PGRST116") {
      logger.error({ err: { code: invoiceErr.code } }, "sendReminder: invoice fetch failed");
    }
    return { ok: false, error: "Invoice not found" };
  }

  const invoice = invoiceRow as unknown as InvoiceForReminder;

  if (!invoice.public_token) {
    return {
      ok: false,
      error: "Invoice has not been issued yet — issue it before sending a reminder",
    };
  }

  if (invoice.status === "paid") {
    return { ok: false, error: "This invoice is already paid" };
  }

  if (invoice.status === "cancelled") {
    return { ok: false, error: "Cancelled invoices cannot be reminded" };
  }

  const customer = Array.isArray(invoice.customers) ? invoice.customers[0] : invoice.customers;
  const dispatchBase: ReminderDispatchParams = { supabase, businessId, invoice };

  if (channel === "whatsapp") {
    const phone = customer?.phone ?? null;
    if (!phone) {
      return { ok: false, error: "Customer has no phone number on file" };
    }
    return dispatchReminderWhatsApp({ ...dispatchBase, phone });
  }

  const recipientEmail = customer?.email ?? null;
  if (!recipientEmail) {
    return { ok: false, error: "Customer has no email address on file" };
  }
  const customerName = customer?.name ?? "Customer";
  return dispatchReminderEmail({ ...dispatchBase, recipientEmail, customerName });
}

// ── sendReceipt ───────────────────────────────────────────────────────────────

const SendReceiptInputSchema = z.object({
  invoiceId: z.string().uuid("Invalid invoice ID"),
});

interface InvoiceForReceipt {
  id: string;
  number: string | null;
  status: string;
  public_token: string | null;
  total: number;
  amount_paid: number;
  customer_id: string | null;
  customers: { phone: string | null; name: string } | null;
}

interface ReceiptDispatchParams {
  supabase: Awaited<ReturnType<typeof createClient>>;
  businessId: string;
  invoiceId: string;
  phone: string;
  invoiceNumber: string;
  amount: string;
  receiptUrl: string;
}

async function dispatchReceiptWhatsApp(params: ReceiptDispatchParams): Promise<SendReceiptResult> {
  const { supabase, businessId, invoiceId, phone, invoiceNumber, amount, receiptUrl } = params;

  const sendResult = await sendWhatsAppReceipt({
    recipientPhone: phone,
    invoiceNumber,
    amount,
    receiptUrl,
  });

  const outcome = sendResult.ok ? "sent" : "failed";
  const providerMsgId = sendResult.ok ? sendResult.providerMsgId : null;
  const logError = sendResult.ok ? null : sendResult.error;

  const messageLogId = await writeDispatchLog({
    supabase,
    businessId,
    invoiceId,
    channel: "whatsapp",
    outcome,
    providerMsgId,
    logError,
    eventType: "receipt.dispatched",
  });

  if (!sendResult.ok) {
    return { ok: false, error: `WhatsApp receipt send failed: ${sendResult.error}` };
  }

  return { ok: true, data: { invoiceId, messageLogId, outcome: "sent" } };
}

/**
 * sendReceipt — Issue #19 Server Action (WhatsApp receipt dispatch).
 *
 * Sends a past-tense payment-confirmation WhatsApp message to the invoice's
 * customer after the invoice has been paid. Uses a DISTINCT receipt template
 * (WHATSAPP_RECEIPT_TEMPLATE_NAME) — never the pay-link template — because
 * the message is a receipt confirmation, not a payment request.
 *
 * Binding decisions:
 * - Only paid invoices can receive a receipt (status guard; honest-receipt principle).
 * - DOES NOT touch invoices.status or any lifecycle field — dispatch logging only.
 * - ENV-GATED: when receipt credentials are absent the live POST is skipped;
 *   a 'skipped' message_log row is written and { ok:true, data:{ skipped:true } }
 *   is returned — this is the expected dev/CI path today.
 * - Requires public_token (invoice must be issued); /pay/[token] serves as the
 *   receipt page for paid invoices.
 * - invoice_events.type = "receipt.dispatched" (channel "whatsapp").
 * - No revalidateBusiness — dispatch logging only (matches sendInvoice precedent).
 */
export async function sendReceipt(invoiceId: unknown): Promise<SendReceiptResult> {
  const parsed = SendReceiptInputSchema.safeParse({ invoiceId });
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
    .select(
      "id, number, status, public_token, total, amount_paid, customer_id, customers(phone, name)",
    )
    .eq("id", uuid)
    .eq("business_id", businessId)
    .single();

  if (invoiceErr || !invoiceRow) {
    if (invoiceErr && invoiceErr.code !== "PGRST116") {
      logger.error({ err: { code: invoiceErr.code } }, "sendReceipt: invoice fetch failed");
    }
    return { ok: false, error: "Invoice not found" };
  }

  const invoice = invoiceRow as unknown as InvoiceForReceipt;

  if (!invoice.public_token) {
    return {
      ok: false,
      error: "Invoice has not been issued yet — issue it before sending a receipt",
    };
  }

  if (invoice.status !== "paid") {
    return { ok: false, error: "Only paid invoices can have a receipt sent" };
  }

  const customer = Array.isArray(invoice.customers) ? invoice.customers[0] : invoice.customers;
  const phone = customer?.phone ?? null;

  if (!phone) {
    return { ok: false, error: "Customer has no phone number on file" };
  }

  /*
   * Build the absolute receipt URL. Prefer NEXT_PUBLIC_APP_URL (the deployed app
   * origin, e.g. https://app.arthapatra.in). Falls back to NEXT_PUBLIC_SUPABASE_URL
   * in local dev. The /pay/[token] route serves as the receipt view for paid invoices.
   */
  const appBase = serverEnv.NEXT_PUBLIC_APP_URL ?? serverEnv.NEXT_PUBLIC_SUPABASE_URL;
  const receiptUrl = `${appBase}/pay/${invoice.public_token}`;
  const invoiceNumber = invoice.number ?? uuid;
  const amount = formatPaise(invoice.total);

  // ── ENV GATE ──────────────────────────────────────────────────────────────
  //
  // Skip the live Cloud API call when receipt WABA credentials are not yet
  // provisioned. The 'skipped' log row lets operators see dispatch attempts;
  // the non-alarming ok:true result lets the UI show a notice without treating
  // it as an error. This is the expected path in dev/CI today.
  if (!isWhatsAppReceiptConfigured()) {
    logger.info(
      { invoiceId: uuid },
      "sendReceipt: WhatsApp receipt not configured — skipping dispatch",
    );

    const messageLogId = await writeDispatchLog({
      supabase,
      businessId,
      invoiceId: uuid,
      channel: "whatsapp",
      outcome: "skipped",
      providerMsgId: null,
      logError: "WhatsApp receipt not configured",
      eventType: "receipt.dispatched",
    });

    return {
      ok: true,
      data: { invoiceId: uuid, messageLogId, outcome: "skipped", skipped: true },
    };
  }

  // ── Live dispatch via WhatsApp Cloud API ──────────────────────────────────

  return dispatchReceiptWhatsApp({
    supabase,
    businessId,
    invoiceId: uuid,
    phone,
    invoiceNumber,
    amount,
    receiptUrl,
  });
}

// ── Pagination read-path actions ──────────────────────────────────────────────

export interface FetchInvoicesPageResult {
  ok: true;
  page: InvoicePage;
  counts: InvoiceStatusCounts;
}

export interface FetchInvoicesPageError {
  ok: false;
  error: string;
}

export type FetchInvoicesPageAction = FetchInvoicesPageResult | FetchInvoicesPageError;

export async function fetchInvoicesPage(
  status: InvoiceStatusFilter,
  cursor: InvoicePageCursor | null,
): Promise<FetchInvoicesPageAction> {
  const statusParsed = FetchInvoicesPageStatusSchema.safeParse(status);
  if (!statusParsed.success) {
    logger.error(
      { err: { message: statusParsed.error.message } },
      "fetchInvoicesPage: invalid status",
    );
    return { ok: false, error: "Invalid status filter" };
  }

  const cursorParsed = FetchInvoicesPageCursorSchema.safeParse(cursor);
  if (!cursorParsed.success) {
    logger.error(
      { err: { message: cursorParsed.error.message } },
      "fetchInvoicesPage: invalid cursor",
    );
    return { ok: false, error: "Invalid cursor" };
  }

  const supabase = await createClient();
  const businessId = await resolveId(supabase);
  if (!businessId) return { ok: false, error: "Not authenticated" };

  const [page, counts] = await Promise.all([
    listInvoicesPage({ businessId, status, cursor, limit: 25 }),
    getInvoiceStatusCounts({ businessId }),
  ]);

  return { ok: true, page, counts };
}
