import { z } from "zod";

/**
 * Zod schema for the jsonb payload returned by the get_public_invoice(p_token) RPC.
 * Keys match the SQL jsonb_build_object in 20260611230000_public_invoice_token_rpc.sql exactly.
 */
export const PublicInvoiceRpcSchema = z.object({
  invoice_id: z.uuid(),
  invoice_number: z.string(),
  status: z.string(),
  issue_date: z.string(),
  due_date: z.string().nullable(),
  is_interstate: z.boolean(),
  gst_enabled: z.boolean(),
  subtotal: z.number().int(),
  discount: z.number().int(),
  cgst: z.number().int(),
  sgst: z.number().int(),
  igst: z.number().int(),
  tax_total: z.number().int(),
  round_off: z.number().int(),
  total: z.number().int(),
  amount_paid: z.number().int(),
  terms: z.string().nullable(),
  business_name: z.string(),
  business_gstin: z.string().nullable(),
  business_upi_id: z.string().nullable(),
  business_logo_url: z.string().nullable(),
  customer_name: z.string().nullable(),
  line_items: z.array(z.unknown()),
});

export type PublicInvoiceRpc = z.infer<typeof PublicInvoiceRpcSchema>;
