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
  invoiceId: z.uuid("Invalid invoice ID"),
  method: z.enum(PAYMENT_METHODS).default("upi"),
});

export type MarkInvoicePaidInput = z.infer<typeof MarkInvoicePaidSchema>;

/**
 * Server Action input schema for issue #18 markInvoiceUnpaid.
 *
 * - invoiceId: UUID of the paid invoice to reverse
 *
 * businessId is derived server-side from the session's membership; the RPC
 * (mark_invoice_unpaid) is the real authorization + manual-only boundary.
 */
export const MarkInvoiceUnpaidSchema = z.object({
  invoiceId: z.uuid("Invalid invoice ID"),
});

export type MarkInvoiceUnpaidInput = z.infer<typeof MarkInvoiceUnpaidSchema>;

/**
 * Server Action input schema for AP-19 cancelInvoice.
 *
 * - invoiceId: UUID of the invoice to cancel
 */
export const CancelInvoiceSchema = z.object({
  invoiceId: z.uuid("Invalid invoice ID"),
});

export type CancelInvoiceInput = z.infer<typeof CancelInvoiceSchema>;

/**
 * Server Action input schema for AP-19 duplicateInvoice.
 *
 * - invoiceId: UUID of the invoice to duplicate (any status is valid)
 */
export const DuplicateInvoiceSchema = z.object({
  invoiceId: z.uuid("Invalid invoice ID"),
});

export type DuplicateInvoiceInput = z.infer<typeof DuplicateInvoiceSchema>;

/**
 * Server Action input schema for AP-19 deleteInvoice.
 *
 * - invoiceId: UUID of the draft invoice to delete
 */
export const DeleteInvoiceSchema = z.object({
  invoiceId: z.uuid("Invalid invoice ID"),
});

export type DeleteInvoiceInput = z.infer<typeof DeleteInvoiceSchema>;
