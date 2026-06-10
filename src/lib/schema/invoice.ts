import { z } from "zod";

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
