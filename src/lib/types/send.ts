export type SendChannel = "whatsapp" | "sms";
export type SendState = "idle" | "sending" | "sent" | "failed";

export type WhatsAppOutcome = "sent" | "failed" | "skipped";

export interface SendInvoiceData {
  invoiceId: string;
  messageLogId: string;
  outcome: WhatsAppOutcome;
  /** True when WhatsApp credentials are not yet configured (dev/CI path). */
  skipped?: boolean;
}

export type SendInvoiceResult = { ok: true; data: SendInvoiceData } | { ok: false; error: string };
