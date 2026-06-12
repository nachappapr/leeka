import type { Database } from "@/lib/types/database";

export type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];

/**
 * Shape returned by the mark_invoice_paid RPC on success.
 * All money values are integer paise.
 */
export interface MarkInvoicePaidRow {
  invoice_id: string;
  amount_paid: number;
  status: InvoiceStatus;
  paid_at: string;
}

/**
 * Success data shape surfaced by the markInvoicePaid Server Action.
 * Camel-cased for TypeScript consumers; mirrors the RPC's jsonb_build_object.
 */
export interface MarkInvoicePaidData {
  invoiceId: string;
  amountPaid: number;
  status: InvoiceStatus;
  paidAt: string;
}

export type MarkInvoicePaidResult =
  | { ok: true; data: MarkInvoicePaidData }
  | { ok: false; error: string };

/**
 * Shape returned by the cancel_invoice RPC on success.
 */
export interface CancelInvoiceRow {
  invoice_id: string;
  status: InvoiceStatus;
}

/**
 * Success data shape surfaced by the cancelInvoice Server Action.
 */
export interface CancelInvoiceData {
  invoiceId: string;
  status: InvoiceStatus;
}

export type CancelInvoiceResult =
  | { ok: true; data: CancelInvoiceData }
  | { ok: false; error: string };
