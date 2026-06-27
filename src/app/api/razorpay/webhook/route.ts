import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv, isRazorpayConfigured } from "@/lib/env.server";
import { RazorpayWebhookBodySchema } from "@/lib/schema/razorpay";
import type { ApplySubscriptionEventResult } from "@/lib/types/billing";
import logger from "@/lib/logger";

// ── Lifecycle map ─────────────────────────────────────────────────────────────
// Maps Razorpay subscription event types to the target plan value.
// Events not present in this map are logged and ignored (valid-sig but
// unrecognised events return 200 without calling the RPC).
// "subscription.pending" / "subscription.updated" / etc. are intentionally
// absent — they do not trigger a plan flip.
const LIFECYCLE_MAP: Record<string, "free" | "pro"> = {
  "subscription.activated": "pro",
  "subscription.charged": "pro",
  "subscription.cancelled": "free",
  "subscription.halted": "free",
  "subscription.completed": "free",
};

// ── Signature verification ─────────────────────────────────────────────────────
// Razorpay HMAC-SHA256: the signature is a plain hex digest of the raw body
// signed with RAZORPAY_WEBHOOK_SECRET.  There is NO "sha256=" prefix (unlike
// Meta/GitHub webhooks) — the header value is the bare hex string.
// Compare using timingSafeEqual to prevent timing-side-channel leaks.
function verifySignature(rawBody: string, sigHeader: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const sigBuf = Buffer.from(sigHeader, "utf8");
  const expBuf = Buffer.from(expected, "utf8");
  return sigBuf.length === expBuf.length && timingSafeEqual(sigBuf, expBuf);
}

// ── POST: Razorpay subscription webhook ───────────────────────────────────────
// 1. Benign skip when Razorpay is not yet configured (env-gated).
// 2. Read raw body as text (required for HMAC — reparsed JSON would not
//    reproduce the original byte sequence and would always fail verification).
// 3. Verify x-razorpay-signature with timingSafeEqual → 401 on failure.
// 4. Zod-validate the payload envelope + subscription entity.
// 5. Resolve target plan from LIFECYCLE_MAP; log + 200 for unknown event types.
// 6. Call apply_subscription_event via admin client (SECURITY DEFINER RPC).
// 7. Always return 2xx after a valid signature — Razorpay retries non-2xx.
export async function POST(request: Request): Promise<Response> {
  if (!isRazorpayConfigured()) {
    return Response.json({ ok: true, skipped: true });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch (err) {
    logger.error({ err: { message: String(err) } }, "razorpay/webhook: failed to read body");
    return Response.json({ ok: false }, { status: 400 });
  }

  const sigHeader = request.headers.get("x-razorpay-signature");
  if (!sigHeader) {
    logger.error({}, "razorpay/webhook: missing x-razorpay-signature");
    return Response.json({ ok: false }, { status: 401 });
  }

  if (!verifySignature(rawBody, sigHeader, serverEnv.RAZORPAY_WEBHOOK_SECRET!)) {
    logger.error({}, "razorpay/webhook: invalid x-razorpay-signature");
    return Response.json({ ok: false }, { status: 401 });
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    logger.error({}, "razorpay/webhook: body is not valid JSON");
    return Response.json({ ok: true });
  }

  const parseResult = RazorpayWebhookBodySchema.safeParse(parsedBody);
  if (!parseResult.success) {
    logger.info(
      { issues: parseResult.error.issues.length },
      "razorpay/webhook: payload schema mismatch — ignored",
    );
    return Response.json({ ok: true });
  }

  const { event, id: eventId, payload } = parseResult.data;
  const entity = payload.subscription.entity;

  const targetPlan = LIFECYCLE_MAP[event];
  if (targetPlan === undefined) {
    logger.info({ event }, "razorpay/webhook: unrecognised event type — ignored");
    return Response.json({ ok: true });
  }

  // Resolve business_id from the subscription notes (set at creation time).
  const businessId = entity.notes.business_id;

  // Convert current_end (Unix epoch seconds) to timestamptz; null when absent.
  const currentPeriodEnd =
    entity.current_end != null ? new Date(entity.current_end * 1000).toISOString() : null;

  const admin = createAdminClient();

  // p_current_period_end is timestamptz in SQL (accepts null), but the generated
  // TypeScript type declares it as string (non-nullable) — a known supabase-js
  // codegen limitation for nullable params.  Cast through unknown to satisfy tsc
  // without suppressing ESLint or widening to any.
  type RpcArgs = Parameters<typeof admin.rpc<"apply_subscription_event">>[1];
  const rpcArgs = {
    p_event_id: eventId,
    p_event_type: event,
    p_subscription_id: entity.id,
    p_razorpay_customer_id: entity.customer_id ?? "",
    p_business_id: businessId,
    p_status: entity.status,
    p_current_period_end: currentPeriodEnd,
    p_target_plan: targetPlan,
  } as unknown as RpcArgs;

  const { data, error } = await admin.rpc("apply_subscription_event", rpcArgs);

  if (error) {
    logger.error(
      { err: { code: error.code, message: error.message }, event },
      "razorpay/webhook: apply_subscription_event RPC error",
    );
    // Still return 200 — the RPC error is logged; Razorpay must not retry
    // indefinitely.  A separate alerting mechanism (get_logs / Sentry) catches
    // persistent failures.
    return Response.json({ ok: true });
  }

  const result = data as unknown as ApplySubscriptionEventResult;

  if (result.already_processed) {
    logger.info({ event, eventId }, "razorpay/webhook: already processed — no-op");
  } else {
    logger.info(
      { event, planChanged: result.plan_changed, newPlan: result.new_plan },
      "razorpay/webhook: subscription event applied",
    );
  }

  return Response.json({ ok: true });
}
