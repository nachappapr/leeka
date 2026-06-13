import { z } from "zod";
import { INDIA_STATES } from "@/lib/constants/business";
import { BIZ_TYPES, type BizTypeId } from "@/lib/constants/auth";

const VALID_STATE_CODES = INDIA_STATES.map((s) => s.code);

/**
 * GSTIN format: 2-digit state code + 10-char PAN + 1-char entity number +
 * 1 'Z' + 1 mod-36 checksum.
 * Example: 27AAPFU0939F1ZV
 */
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

/**
 * Validates the mod-36 checksum digit of a GSTIN.
 * Returns true if checksum passes.
 */
function validateGstinChecksum(gstin: string): boolean {
  const CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const val = CHARS.indexOf(gstin[i]!);
    if (val === -1) return false;
    const product = val * (i % 2 === 0 ? 1 : 2);
    sum += Math.floor(product / 36) + (product % 36);
  }
  const checkChar = CHARS[(36 - (sum % 36)) % 36];
  return gstin[14] === checkChar;
}

export const BusinessSchema = z.object({
  name: z
    .string()
    .min(1, "Business name is required")
    .max(100, "Business name must be 100 characters or fewer")
    .trim(),

  address: z
    .string()
    .max(300, "Address must be 300 characters or fewer")
    .trim()
    .optional()
    .or(z.literal("")),

  stateCode: z
    .string()
    .refine(
      (val) => !val || VALID_STATE_CODES.includes(val as (typeof VALID_STATE_CODES)[number]),
      { message: "Invalid state code" },
    )
    .optional()
    .or(z.literal("")),

  gstin: z
    .string()
    .refine(
      (val) => {
        if (!val) return true;
        if (!GSTIN_REGEX.test(val)) return false;
        return validateGstinChecksum(val);
      },
      { message: "Invalid GSTIN" },
    )
    .optional()
    .or(z.literal("")),

  upiId: z
    .string()
    .max(50, "UPI ID must be 50 characters or fewer")
    .refine((val) => !val || val.includes("@"), { message: "Invalid UPI ID format" })
    .optional()
    .or(z.literal("")),

  logoUrl: z.string().optional().or(z.literal("")),

  businessType: z.enum(BIZ_TYPES.map((t) => t.id) as [BizTypeId, ...BizTypeId[]], {
    error: "Business type is required",
  }),
});

export type BusinessFormData = z.infer<typeof BusinessSchema>;

export const OnboardingBusinessSchema = BusinessSchema.extend({
  ownerName: z
    .string()
    .min(1, "Your name is required")
    .max(100, "Your name must be 100 characters or fewer")
    .trim(),
});

export type OnboardingBusinessFormData = z.infer<typeof OnboardingBusinessSchema>;
