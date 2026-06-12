import type { Database } from "@/lib/types/database";

export type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];

/**
 * Shape returned by the record_payment RPC on success.
 * All money values are integer paise.
 */
export interface RecordPaymentRow {
  invoice_id: string;
  amount_paid: number;
  status: InvoiceStatus;
  paid_at: string | null;
}

/**
 * Success data shape surfaced by the recordPayment Server Action.
 * Camel-cased for TypeScript consumers; mirrors the RPC's jsonb_build_object.
 */
export interface RecordPaymentData {
  invoiceId: string;
  amountPaid: number;
  status: InvoiceStatus;
  paidAt: string | null;
}

export type RecordPaymentResult =
  | { ok: true; data: RecordPaymentData }
  | { ok: false; error: string };
