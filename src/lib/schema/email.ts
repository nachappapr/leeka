import { z } from "zod";

/**
 * Zod schema for the Resend webhook POST body.
 *
 * Resend sends a flat object with a `type` discriminator and a `data` payload.
 * Only the fields consumed by AP-28 are modelled here; unknown keys are stripped
 * (z.object default).
 *
 * Relevant event types:
 *   email.delivered — message accepted by the recipient's mail server
 *   email.opened    — recipient opened the email (pixel/link tracking)
 *   email.bounced   — message permanently rejected (hard bounce)
 *
 * Reference: https://resend.com/docs/dashboard/webhooks/event-types
 */

export const ResendEventDataSchema = z.object({
  /** Resend-assigned email ID — matches message_log.provider_msg_id. */
  email_id: z.string().min(1),
  /** Unix epoch timestamp (number) of the event. */
  created_at: z.string().optional(),
});

export type ResendEventData = z.infer<typeof ResendEventDataSchema>;

export const ResendWebhookBodySchema = z.object({
  type: z.enum(["email.delivered", "email.opened", "email.bounced"]),
  data: ResendEventDataSchema,
});

export type ResendWebhookBody = z.infer<typeof ResendWebhookBodySchema>;
