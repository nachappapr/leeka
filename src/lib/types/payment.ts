import type { Database } from "@/lib/types/database";

export type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];

export interface RecordPaymentData {
  invoiceId: string;
  amountPaid: number;
  status: InvoiceStatus;
  paidAt: string | null;
}

export type RecordPaymentResult =
  | { ok: true; data: RecordPaymentData }
  | { ok: false; error: string };
