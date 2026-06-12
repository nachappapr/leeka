import { z } from "zod";

export const TaxSchema = z.object({
  defaultGstRate: z
    .number({ message: "Enter a valid number" })
    .int("GST rate must be a whole number")
    .min(0, "GST rate cannot be negative")
    .max(28, "GST rate cannot exceed 28%"),

  gstEnabled: z.boolean(),
});

export type TaxFormData = z.infer<typeof TaxSchema>;
