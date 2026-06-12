import { z } from "zod";

/**
 * One line item in an AP-13 draft invoice.
 * - unit_price: integer paise (e.g. 10000 = ₹100.00)
 * - discount:   integer paise off this line's gross subtotal (default 0)
 * - gst_rate:   percentage (0 / 5 / 12 / 18 / 28 or any numeric ≥ 0)
 */
export const DraftLineItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  hsn_sac: z.string().optional(),
  qty: z.coerce.number().gt(0, "Qty must be > 0"),
  unit_price: z.coerce.number().int().min(0, "Unit price must be ≥ 0"),
  discount: z.coerce.number().int().min(0, "Discount must be ≥ 0").default(0),
  gst_rate: z.coerce.number().min(0, "GST rate must be ≥ 0"),
});

export type DraftLineItem = z.infer<typeof DraftLineItemSchema>;

/**
 * Full draft invoice payload — requires a customer UUID and ≥ 1 valid line.
 * Shared by the create-form and the Server Action (server re-parses this schema).
 */
export const SaveInvoiceDraftSchema = z.object({
  customerId: z.string().uuid("Customer is required"),
  invoiceId: z.string().uuid().optional(),
  items: z.array(DraftLineItemSchema).min(1, "Add at least one item"),
  notes: z.string().optional(),
});

export type SaveInvoiceDraftInput = z.infer<typeof SaveInvoiceDraftSchema>;

/**
 * RHF form schema — items + notes only (customerId / invoiceId are held in
 * React state, not form fields). Used with standardSchemaResolver in both
 * the create and edit forms.
 *
 * Paise ↔ rupee boundary: unit_price and discount are stored as integer
 * paise in this form state (matching DraftLineItemSchema), but the inputs
 * display rupee values. Controller fields convert on change (×100) and on
 * render (÷100).
 */
export const DraftFormSchema = z.object({
  items: z.array(DraftLineItemSchema).min(1, "Add at least one item"),
  notes: z.string().default(""),
});

export type DraftFormData = z.infer<typeof DraftFormSchema>;
