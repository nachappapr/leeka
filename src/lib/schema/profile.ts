import { z } from "zod";

export const ProfileStepSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(80, "Display name must be 80 characters or fewer")
    .trim(),
});

export type ProfileStepFormData = z.infer<typeof ProfileStepSchema>;
