import { z } from "zod";

/**
 * Payment methods supported by the record_payment RPC.
 * Kept as a string union so new methods can be added without a schema change.
 */
export const PAYMENT_METHODS = ["upi", "cash", "bank_transfer", "cheque", "card", "other"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/**
 * Server Action input schema for AP-18 recordPayment.
 *
 * - invoiceId:  UUID of the invoice being paid against
 * - businessId: UUID of the business (looked up server-side from the session,
 *               but also accepted as input so the caller doesn't need a second
 *               server round-trip — the RPC's membership guard enforces ownership)
 * - amount:     positive integer paise (e.g. 100000 = ₹1000.00)
 * - method:     payment method; defaults to 'upi'
 * - reference:  optional external reference (e.g. UTR, cheque number)
 * - note:       optional free-text note
 *
 * Both invoiceId and businessId are derived server-side (businessId from the
 * session's membership) to prevent clients from spoofing another tenant's data.
 * The schema intentionally omits businessId from the client payload.
 */
export const RecordPaymentSchema = z.object({
  invoiceId: z.uuid("Invalid invoice ID"),
  amount: z
    .number()
    .int("Amount must be an integer (paise)")
    .positive("Payment amount must be greater than zero"),
  method: z.enum(PAYMENT_METHODS).default("upi"),
  reference: z.string().max(255).optional(),
  note: z.string().max(1000).optional(),
});

export type RecordPaymentInput = z.infer<typeof RecordPaymentSchema>;
