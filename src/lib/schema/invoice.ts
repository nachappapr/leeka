import { z } from "zod";

// Legacy UI schema (AP-12 form). Do NOT remove or rename these exports; Unit 2 will migrate callers.

export const InvoiceEditItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  qty: z.coerce.number().min(1, "Qty must be ≥ 1"),
  price: z.coerce.number().min(0, "Price must be ≥ 0"),
});

export const InvoiceEditSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Enter a valid email").or(z.literal("")),
  items: z.array(InvoiceEditItemSchema).min(1, "Add at least one item"),
  notes: z.string(),
});

export type InvoiceEditFormData = z.infer<typeof InvoiceEditSchema>;

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
