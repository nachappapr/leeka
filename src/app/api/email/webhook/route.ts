import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv, isEmailWebhookConfigured } from "@/lib/env.server";
import { ResendWebhookBodySchema } from "@/lib/schema/email";
import type { MarkEmailStatusResult } from "@/lib/types/email-webhook";
import { revalidateBusiness } from "@/lib/cache/revalidate-business";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import logger from "@/lib/logger";

// ── Svix signature verification ───────────────────────────────────────────────
// Resend uses Svix to sign webhooks. The signed content is:
//   `${svix-id}.${svix-timestamp}.${rawBody}`
// The secret is the base64-decoded portion after the "whsec_" prefix.
// svix-signature is a space-separated list of "v1,<base64sig>" entries;
// we verify against each entry using timingSafeEqual.
//
// Reference: https://docs.svix.com/receiving/verifying-payloads/how-manual
function verifySvixSignature(
  rawBody: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  secret: string,
): boolean {
  // Decode the whsec_ secret (strip the "whsec_" prefix, then base64-decode).
  const secretBase64 = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  const secretBytes = Buffer.from(secretBase64, "base64");

  // Construct the signed content exactly as Svix specifies.
  const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;

  // Compute HMAC-SHA256 over the signed content.
  const computedMac = createHmac("sha256", secretBytes).update(signedContent).digest("base64");
  const computedBuf = Buffer.from(computedMac, "utf8");

  // svix-signature is a space-separated list of "v1,<base64sig>" entries.
  // Verify timing-safe against each entry; succeed on the first match.
  const entries = svixSignature.split(" ");
  for (const entry of entries) {
    const parts = entry.split(",");
    // Skip entries with an unrecognised version prefix (forward-compat).
    if (parts[0] !== "v1" || parts[1] === undefined) continue;
    const candidateBuf = Buffer.from(parts[1], "utf8");
    if (candidateBuf.length === computedBuf.length && timingSafeEqual(candidateBuf, computedBuf)) {
      return true;
    }
  }
  return false;
}

// ── Per-event RPC call ────────────────────────────────────────────────────────
// Maps Resend event type to the status string expected by mark_email_status.
// email.bounced is terminal — status='failed' regardless of rank; the RPC
// handles the no-downgrade guard but bounced always overwrites.
function resendEventToStatus(type: "email.delivered" | "email.opened" | "email.bounced"): string {
  switch (type) {
    case "email.delivered":
      return "delivered";
    case "email.opened":
      return "opened";
    case "email.bounced":
      return "bounced";
  }
}

async function processEvent(
  admin: SupabaseClient<Database>,
  type: "email.delivered" | "email.opened" | "email.bounced",
  emailId: string,
): Promise<void> {
  const status = resendEventToStatus(type);

  const { data, error } = await admin.rpc("mark_email_status", {
    p_provider_msg_id: emailId,
    p_status: status,
  });

  if (error) {
    logger.error(
      { err: { code: error.code, message: error.message }, eventType: type },
      "email/webhook: mark_email_status RPC error",
    );
    return;
  }

  const result = data as unknown as MarkEmailStatusResult;

  if (!result.message_found) {
    logger.info({ eventType: type }, "email/webhook: unknown provider_msg_id — skipped");
  } else if (result.invoice_transitioned && result.business_id) {
    logger.info({ eventType: type }, "email/webhook: invoice transitioned to viewed");
    revalidateBusiness(result.business_id);
  }
}

// ── POST: Resend event callback ───────────────────────────────────────────────
// 1. Read raw body as text (required for HMAC — reparsed JSON would not reproduce
//    the original byte sequence and would always fail verification).
// 2. Verify svix-signature with timingSafeEqual → 401 on failure.
// 3. Parse + validate the payload with Zod.
// 4. For each event call mark_email_status via the admin client.
// 5. Always return 2xx after a valid signature — Resend retries non-2xx.
export async function POST(request: Request): Promise<Response> {
  if (!isEmailWebhookConfigured()) {
    return Response.json({ ok: true, skipped: true });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch (err) {
    logger.error({ err: { message: String(err) } }, "email/webhook: failed to read body");
    return Response.json({ ok: false }, { status: 400 });
  }

  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    logger.error({}, "email/webhook: missing svix signature headers");
    return Response.json({ ok: false }, { status: 401 });
  }

  if (
    !verifySvixSignature(
      rawBody,
      svixId,
      svixTimestamp,
      svixSignature,
      serverEnv.RESEND_WEBHOOK_SECRET!,
    )
  ) {
    logger.error({}, "email/webhook: invalid svix signature");
    return Response.json({ ok: false }, { status: 401 });
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    logger.error({}, "email/webhook: body is not valid JSON");
    return Response.json({ ok: true });
  }

  const parseResult = ResendWebhookBodySchema.safeParse(parsedBody);
  if (!parseResult.success) {
    // Unknown event types (email.complained, etc.) arrive here — return 200 so
    // Resend doesn't retry events we intentionally ignore.
    logger.info(
      { issues: parseResult.error.issues.length },
      "email/webhook: unrecognised event type — ignored",
    );
    return Response.json({ ok: true });
  }

  const admin = createAdminClient();
  await processEvent(admin, parseResult.data.type, parseResult.data.data.email_id);

  return Response.json({ ok: true });
}
