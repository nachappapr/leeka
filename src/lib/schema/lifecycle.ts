import { z } from "zod";
import { PAYMENT_METHODS } from "@/lib/schema/payment";

/**
 * Server Action input schema for AP-19 markInvoicePaid.
 *
 * - invoiceId: UUID of the invoice to settle
 * - method:    optional payment method (defaults to 'upi'); the RPC inserts
 *              one payment row for the outstanding amount using this method
 *
 * businessId is derived server-side from the session's membership —
 * clients never supply it directly, preventing cross-tenant spoofing.
 */
export const MarkInvoicePaidSchema = z.object({
  invoiceId: z.string().uuid("Invalid invoice ID"),
  method: z.enum(PAYMENT_METHODS).default("upi"),
});

export type MarkInvoicePaidInput = z.infer<typeof MarkInvoicePaidSchema>;

/**
 * Server Action input schema for AP-19 cancelInvoice.
 *
 * - invoiceId: UUID of the invoice to cancel
 */
export const CancelInvoiceSchema = z.object({
  invoiceId: z.string().uuid("Invalid invoice ID"),
});

export type CancelInvoiceInput = z.infer<typeof CancelInvoiceSchema>;
