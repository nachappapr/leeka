"use server";

import { createClient } from "@/lib/supabase/server";
import { serverEnv, isRazorpayConfigured } from "@/lib/env.server";
import { RazorpayCreateSubscriptionResponseSchema } from "@/lib/schema/razorpay";
import type { CreateSubscriptionResult } from "@/lib/types/billing";
import logger from "@/lib/logger";

async function getBusinessId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<string | null> {
  const { data: member } = await supabase
    .from("business_members")
    .select("business_id")
    .eq("user_id", userId)
    .single();
  return member?.business_id ?? null;
}

/**
 * Reads the active 'pro' plan row from the plans catalog table.
 *
 * Returns null when: no active pro plan exists, or its razorpay_plan_id is
 * null (placeholder — not yet set up). Both cases are treated identically
 * as "billing not yet available" by the caller.
 *
 * The RLS SELECT policy restricts authenticated reads to is_active rows, so
 * the WHERE is_active clause is redundant but kept for explicitness.
 */
async function getActiveProPlanId(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("plans")
    .select("razorpay_plan_id")
    .eq("code", "pro")
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      // PGRST116 = no rows found — expected when plan not seeded; log others.
      logger.error({ err: error }, "getActiveProPlanId: DB error reading plans");
    }
    return null;
  }

  return data?.razorpay_plan_id ?? null;
}

/**
 * createSubscription — AP-46 Server Action (revised).
 *
 * Initiates a Razorpay recurring subscription for the caller's business.
 *
 * Env-gated (first check): if Razorpay key credentials are not configured,
 * returns fail-closed {ok:false} without throwing.
 *
 * DB-gated (second check): reads the active 'pro' plan's razorpay_plan_id
 * from the plans catalog table. If the row is missing or razorpay_plan_id is
 * null (placeholder), returns the same fail-closed shape — identical UX to
 * the unconfigured-env path. This means billing stays inert until both
 * env keys AND a real Razorpay Plan are provisioned.
 *
 * On success returns the Razorpay subscriptionId and the KEY_ID (publishable
 * key) so the client can open the Razorpay checkout widget. KEY_SECRET and
 * WEBHOOK_SECRET are NEVER returned.
 *
 * The subscription notes.business_id field is set here so the webhook
 * route can resolve the business from the Razorpay payload without a
 * separate DB lookup by razorpay_subscription_id.
 *
 * BILLING AUTHORITY: Razorpay's Plan is the billing authority for the charged
 * amount. Only the plan_id is sent — amount_inr from the plans table is never
 * sent as a charge override to Razorpay.
 */
export async function createSubscription(): Promise<CreateSubscriptionResult> {
  if (!isRazorpayConfigured()) {
    return { ok: false, error: "Billing is not yet available." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const businessId = await getBusinessId(supabase, user.id);
  if (!businessId) {
    return { ok: false, error: "No business found for this account" };
  }

  // Read the active pro plan id from the DB catalog (AP-46 revision).
  // null means: no active plan row, or razorpay_plan_id is the NULL placeholder.
  const planId = await getActiveProPlanId(supabase);
  if (!planId) {
    return { ok: false, error: "Billing is not yet available." };
  }

  // Build Basic auth header: base64(KEY_ID:KEY_SECRET).
  // KEY_ID and KEY_SECRET are server-only; never sent to the browser.
  const credentials = Buffer.from(
    `${serverEnv.RAZORPAY_KEY_ID!}:${serverEnv.RAZORPAY_KEY_SECRET!}`,
  ).toString("base64");

  let response: Response;
  try {
    response = await fetch("https://api.razorpay.com/v1/subscriptions", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_id: planId,
        total_count: 12,
        customer_notify: 1,
        notes: { business_id: businessId },
      }),
    });
  } catch (err) {
    logger.error({ err: { message: String(err) } }, "createSubscription: network error");
    return { ok: false, error: "Failed to create subscription. Please try again." };
  }

  if (!response.ok) {
    logger.error({ status: response.status }, "createSubscription: Razorpay API returned non-2xx");
    return { ok: false, error: "Failed to create subscription. Please try again." };
  }

  let responseBody: unknown;
  try {
    responseBody = await response.json();
  } catch (err) {
    logger.error({ err: { message: String(err) } }, "createSubscription: failed to parse response");
    return { ok: false, error: "Failed to create subscription. Please try again." };
  }

  const parsed = RazorpayCreateSubscriptionResponseSchema.safeParse(responseBody);
  if (!parsed.success) {
    logger.error(
      { issues: parsed.error.issues.length },
      "createSubscription: unexpected response shape from Razorpay",
    );
    return { ok: false, error: "Failed to create subscription. Please try again." };
  }

  return {
    ok: true,
    subscriptionId: parsed.data.id,
    razorpayKeyId: serverEnv.RAZORPAY_KEY_ID!,
  };
}
