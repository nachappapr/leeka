import type { Database } from "@/lib/types/database";

export type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];

export interface MarkInvoicePaidData {
  invoiceId: string;
  amountPaid: number;
  status: InvoiceStatus;
  paidAt: string;
}

export type MarkInvoicePaidResult =
  | { ok: true; data: MarkInvoicePaidData }
  | { ok: false; error: string };

export interface MarkInvoiceUnpaidData {
  invoiceId: string;
  status: InvoiceStatus;
}

export type MarkInvoiceUnpaidResult =
  | { ok: true; data: MarkInvoiceUnpaidData }
  | { ok: false; error: string };

export interface CancelInvoiceData {
  invoiceId: string;
  status: InvoiceStatus;
}

export type CancelInvoiceResult =
  | { ok: true; data: CancelInvoiceData }
  | { ok: false; error: string };

export interface DuplicateInvoiceData {
  invoiceId: string;
  status: InvoiceStatus;
}

export type DuplicateInvoiceResult =
  | { ok: true; data: DuplicateInvoiceData }
  | { ok: false; error: string };

export interface DeleteInvoiceData {
  invoiceId: string;
  deleted: boolean;
}

export type DeleteInvoiceResult =
  | { ok: true; data: DeleteInvoiceData }
  | { ok: false; error: string };

export interface SweepOverdueRow {
  swept_count: number;
  invoice_ids: string[];
  business_ids: string[];
}
