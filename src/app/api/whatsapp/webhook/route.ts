import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv, isWhatsAppWebhookConfigured } from "@/lib/env.server";
import { MetaWebhookBodySchema, type MetaStatus } from "@/lib/schema/whatsapp";
import type { MarkMessageStatusResult } from "@/lib/types/whatsapp-webhook";
import { revalidateBusiness } from "@/lib/cache/revalidate-business";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import logger from "@/lib/logger";

// ── Signature verification ────────────────────────────────────────────────────
// Computes HMAC-SHA256(rawBody, appSecret) and compares to the header value
// using timingSafeEqual to prevent timing-side-channel leaks.
// The header format is: "sha256=<hex-digest>".
function verifySignature(rawBody: string, sigHeader: string, appSecret: string): boolean {
  const expected = "sha256=" + createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const sigBuf = Buffer.from(sigHeader, "utf8");
  const expBuf = Buffer.from(expected, "utf8");
  return sigBuf.length === expBuf.length && timingSafeEqual(sigBuf, expBuf);
}

// ── Per-status RPC call ───────────────────────────────────────────────────────
// Calls mark_message_status for one status entry. Logs errors and unknown IDs
// but never throws — failures must not prevent the 200 response to Meta.
async function processStatus(admin: SupabaseClient<Database>, status: MetaStatus): Promise<void> {
  const { data, error } = await admin.rpc("mark_message_status", {
    p_provider_msg_id: status.id,
    p_status: status.status,
  });

  if (error) {
    logger.error(
      { err: { code: error.code, message: error.message }, msgStatus: status.status },
      "whatsapp/webhook: mark_message_status RPC error",
    );
    return;
  }

  const result = data as unknown as MarkMessageStatusResult;

  if (!result.message_found) {
    logger.info(
      { msgStatus: status.status },
      "whatsapp/webhook: unknown provider_msg_id — skipped",
    );
  } else if (result.invoice_transitioned && result.business_id) {
    logger.info({ msgStatus: status.status }, "whatsapp/webhook: invoice transitioned to viewed");
    revalidateBusiness(result.business_id);
  }
}

// ── GET: Meta webhook verification challenge ─────────────────────────────────
// Meta sends hub.mode, hub.verify_token, hub.challenge as query params when
// registering the webhook. Respond with the challenge as text/plain on match.
export async function GET(request: Request): Promise<Response> {
  if (!isWhatsAppWebhookConfigured()) {
    return new Response("Webhook not configured", { status: 503 });
  }

  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === serverEnv.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge ?? "", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return new Response("Forbidden", { status: 403 });
}

// ── POST: Meta status callback ────────────────────────────────────────────────
// 1. Read raw body as text (required for HMAC — reparsed JSON would not reproduce
//    the original byte sequence and would always fail verification).
// 2. Verify X-Hub-Signature-256 with timingSafeEqual → 401 on failure.
// 3. Parse + validate the payload with Zod.
// 4. For each status entry call mark_message_status via the admin client.
// 5. Always return 200 after a valid signature — Meta retries non-2xx aggressively
//    and will disable webhooks that error consistently.
export async function POST(request: Request): Promise<Response> {
  if (!isWhatsAppWebhookConfigured()) {
    return Response.json({ ok: true, skipped: true });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch (err) {
    logger.error({ err: { message: String(err) } }, "whatsapp/webhook: failed to read body");
    return Response.json({ ok: false }, { status: 400 });
  }

  const sigHeader = request.headers.get("x-hub-signature-256");
  if (!sigHeader) {
    logger.error({}, "whatsapp/webhook: missing X-Hub-Signature-256");
    return Response.json({ ok: false }, { status: 401 });
  }

  if (!verifySignature(rawBody, sigHeader, serverEnv.WHATSAPP_APP_SECRET!)) {
    logger.error({}, "whatsapp/webhook: invalid X-Hub-Signature-256");
    return Response.json({ ok: false }, { status: 401 });
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    logger.error({}, "whatsapp/webhook: body is not valid JSON");
    return Response.json({ ok: true });
  }

  const parseResult = MetaWebhookBodySchema.safeParse(parsedBody);
  if (!parseResult.success) {
    logger.error(
      { issues: parseResult.error.issues.length },
      "whatsapp/webhook: payload schema mismatch",
    );
    return Response.json({ ok: true });
  }

  const admin = createAdminClient();

  for (const entry of parseResult.data.entry) {
    for (const change of entry.changes) {
      for (const status of change.value.statuses ?? []) {
        await processStatus(admin, status);
      }
    }
  }

  return Response.json({ ok: true });
}
