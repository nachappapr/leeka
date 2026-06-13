/** Shape of the jsonb returned by apply_subscription_event(). */
export interface ApplySubscriptionEventResult {
  already_processed: boolean;
  plan_changed: boolean;
  new_plan: string;
}

/** Result type for the createSubscription Server Action. */
export type CreateSubscriptionResult =
  | { ok: true; subscriptionId: string; razorpayKeyId: string }
  | { ok: false; error: string };
