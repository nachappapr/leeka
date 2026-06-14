import { z } from "zod";

const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const CustomerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  phone: z
    .string()
    .min(1, "Phone is required")
    .refine(
      (val) => {
        let digits = val.replace(/\D/g, "");
        if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
        else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
        return /^[6-9]\d{9}$/.test(digits);
      },
      { message: "Enter a valid 10-digit mobile number" },
    ),
  email: z.email("Enter a valid email").or(z.literal("")).optional(),
  gstin: z.string().regex(GSTIN_RE, "Invalid GSTIN format").or(z.literal("")).optional(),
  stateCode: z.string().optional(),
  city: z.string().optional(),
  billingAddress: z.string().optional(),
  notes: z.string().optional(),
  openingBalance: z.number().min(0).optional(),
});

export type CustomerFormData = z.infer<typeof CustomerSchema>;
