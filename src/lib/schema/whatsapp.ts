import { z } from "zod";

/**
 * Zod schema for the Meta WhatsApp Cloud API webhook POST body.
 *
 * Meta sends a nested structure: entry[].changes[].value.statuses[].
 * Each status object carries the provider message ID, the new status,
 * the recipient phone, and a Unix timestamp.
 *
 * Only the fields consumed by AP-26 are modelled here; the full schema
 * has many more optional fields (errors, pricing, conversation) that we
 * ignore. Unknown top-level keys are stripped (z.object default).
 *
 * Reference: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components
 */

export const MetaStatusSchema = z.object({
  /** Provider-assigned message ID — matches message_log.provider_msg_id. */
  id: z.string().min(1),
  /** Delivery status reported by Meta. */
  status: z.enum(["sent", "delivered", "read", "failed"]),
  /** Recipient WhatsApp ID (E.164 without the leading +). Not logged — no PII. */
  recipient_id: z.string(),
  /** Unix epoch timestamp (string) of the status event. */
  timestamp: z.string(),
});

export type MetaStatus = z.infer<typeof MetaStatusSchema>;

const MetaValueSchema = z.object({
  statuses: z.array(MetaStatusSchema).optional(),
});

const MetaChangeSchema = z.object({
  value: MetaValueSchema,
  field: z.string(),
});

const MetaEntrySchema = z.object({
  id: z.string(),
  changes: z.array(MetaChangeSchema),
});

export const MetaWebhookBodySchema = z.object({
  object: z.string(),
  entry: z.array(MetaEntrySchema),
});

export type MetaWebhookBody = z.infer<typeof MetaWebhookBodySchema>;
