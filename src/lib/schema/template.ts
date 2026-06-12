import { z } from "zod";
import { SETTINGS_ACCENTS } from "@/lib/constants/settings";

export const TemplateSchema = z.object({
  accentColor: z.string().refine((v) => (SETTINGS_ACCENTS as readonly string[]).includes(v), {
    message: "Select a valid accent colour",
  }),

  footerMessage: z
    .string()
    .transform((v) => v.trim())
    .pipe(z.string().max(120, "Footer message must be 120 characters or fewer")),
});

export type TemplateFormData = z.infer<typeof TemplateSchema>;
