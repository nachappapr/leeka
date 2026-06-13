import { z } from "zod";

/**
 * Razorpay subscription entity — the nested object inside every
 * subscription.* webhook event payload.
 *
 * Razorpay sends current_end as a Unix epoch integer (seconds).
 * notes is a free-form object; we only require business_id which is set
 * at subscription-creation time by the createSubscription Server Action.
 *
 * Only the fields consumed by AP-46 are modelled here; unknown keys are
 * stripped by z.object() default behaviour.
 *
 * Reference: https://razorpay.com/docs/api/subscriptions/
 */
export const RazorpaySubscriptionNotesSchema = z.object({
  business_id: z.string().uuid(),
});

export const RazorpaySubscriptionEntitySchema = z.object({
  /** Razorpay subscription id, e.g. "sub_…" */
  id: z.string().min(1),
  /** Razorpay customer id, e.g. "cust_…" — may be null before first charge. */
  customer_id: z.string().nullable().optional(),
  /** Subscription status string as reported by Razorpay. */
  status: z.string().min(1),
  /**
   * Unix epoch (seconds) of the end of the current billing period.
   * Null on initial subscription before any charge cycle.
   */
  current_end: z.number().nullable().optional(),
  /** Free-form notes set at creation — must carry business_id. */
  notes: RazorpaySubscriptionNotesSchema,
});

export type RazorpaySubscriptionEntity = z.infer<typeof RazorpaySubscriptionEntitySchema>;

/**
 * Top-level Razorpay webhook event envelope for subscription.* events.
 *
 * Structure: { event, payload: { subscription: { entity: {...} } } }
 */
export const RazorpayWebhookBodySchema = z.object({
  /** Razorpay event type, e.g. "subscription.activated". */
  event: z.string().min(1),
  /** Unique Razorpay event id — used as the idempotency key in billing_events. */
  id: z.string().min(1),
  payload: z.object({
    subscription: z.object({
      entity: RazorpaySubscriptionEntitySchema,
    }),
  }),
});

export type RazorpayWebhookBody = z.infer<typeof RazorpayWebhookBodySchema>;

/**
 * Input schema for the createSubscription Server Action.
 * No user-supplied fields — the action derives everything from session.
 * Defined here for completeness and for use in test fixtures.
 */
export const CreateSubscriptionInputSchema = z.object({});

/**
 * Response schema from Razorpay POST /v1/subscriptions.
 * Only the fields the action returns to the client are modelled.
 */
export const RazorpayCreateSubscriptionResponseSchema = z.object({
  id: z.string().min(1),
});

export type RazorpayCreateSubscriptionResponse = z.infer<
  typeof RazorpayCreateSubscriptionResponseSchema
>;
