export type SendChannel = "whatsapp" | "email" | "sms";
export type SendState = "idle" | "sending" | "sent" | "failed";

export type WhatsAppOutcome = "sent" | "failed" | "skipped";
export type EmailOutcome = "sent" | "failed" | "skipped";

export interface SendInvoiceData {
  invoiceId: string;
  messageLogId: string;
  outcome: WhatsAppOutcome;
  /** True when WhatsApp credentials are not yet configured (dev/CI path). */
  skipped?: boolean;
}

export interface SendInvoiceEmailData {
  invoiceId: string;
  messageLogId: string;
  outcome: EmailOutcome;
  /** True when Resend credentials are not yet configured (dev/CI path). */
  skipped?: boolean;
}

export type SendInvoiceResult = { ok: true; data: SendInvoiceData } | { ok: false; error: string };

export type SendInvoiceEmailResult =
  | { ok: true; data: SendInvoiceEmailData }
  | { ok: false; error: string };
