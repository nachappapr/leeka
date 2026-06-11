import { z } from "zod";

export const ItemSchema = z.object({
  name: z.string().min(1, "Item name is required").max(200),
  hsnSac: z.string().max(20).optional(),
  defaultPrice: z.coerce.number().min(0, "Price must be ≥ 0"),
  defaultGstRate: z.coerce.number().min(0).max(100).default(18),
  unit: z.string().max(20).optional(),
});

export type ItemFormData = z.infer<typeof ItemSchema>;
