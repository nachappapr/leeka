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

export type ReminderOutcome = "sent" | "failed" | "skipped";

export interface SendReminderData {
  invoiceId: string;
  messageLogId: string;
  outcome: ReminderOutcome;
  /** True when the channel credentials are not yet configured (dev/CI path). */
  skipped?: boolean;
}

export type SendReminderResult =
  | { ok: true; data: SendReminderData }
  | { ok: false; error: string };

export type ReceiptOutcome = "sent" | "failed" | "skipped";

export interface SendReceiptData {
  invoiceId: string;
  messageLogId: string;
  outcome: ReceiptOutcome;
  /** True when WhatsApp receipt credentials are not yet configured (dev/CI path). */
  skipped?: boolean;
}

export type SendReceiptResult = { ok: true; data: SendReceiptData } | { ok: false; error: string };
