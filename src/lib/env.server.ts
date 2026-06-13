import "server-only";
import { z } from "zod";

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  // Non-secret Supabase vars — required at startup; safe to commit to CI.
  // We reuse NEXT_PUBLIC_SUPABASE_URL rather than maintaining a duplicate
  // SUPABASE_URL, since both would hold the identical value and drift would
  // silently break server-side requests.
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  // Publishable key — also declared in env.client.ts; duplicated here so
  // server code can access it via typed serverEnv without importing clientEnv.
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  // Service-role key — secret, never exposed to the browser, not NEXT_PUBLIC_.
  // Required at startup so a misconfigured deploy fails immediately rather
  // than silently at the first admin operation.
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  // App public URL — used server-side when building absolute pay links.
  // Optional: falls back to NEXT_PUBLIC_SUPABASE_URL origin when absent.
  NEXT_PUBLIC_APP_URL: z.url().optional(),
  // WhatsApp Cloud API credentials — all optional so the server starts without
  // them. isWhatsAppConfigured() gates any live HTTP call at runtime.
  // None are NEXT_PUBLIC_: phone number ID and access token are secrets.
  WHATSAPP_PHONE_NUMBER_ID: z.string().min(1).optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().min(1).optional(),
  WHATSAPP_TEMPLATE_NAME: z.string().min(1).optional(),
  WHATSAPP_API_VERSION: z.string().min(1).optional(),
  // AP-26: WhatsApp webhook secrets — both optional so the server starts without
  // them. isWhatsAppWebhookConfigured() gates signature verification at call-time.
  // Never NEXT_PUBLIC_: these are secrets and must never reach the browser.
  WHATSAPP_APP_SECRET: z.string().min(1).optional(),
  WHATSAPP_WEBHOOK_VERIFY_TOKEN: z.string().min(1).optional(),
  // AP-28: Resend email credentials — all optional so the server starts without
  // them. isEmailConfigured() gates any live HTTP call at runtime.
  // Never NEXT_PUBLIC_: api key and from address are secrets.
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(1).optional(),
  // AP-28: Resend webhook signing secret (whsec_… format from Resend dashboard).
  // isEmailWebhookConfigured() gates svix signature verification at call-time.
  RESEND_WEBHOOK_SECRET: z.string().min(1).optional(),
  // AP-46: Razorpay billing credentials — all optional so the server starts without
  // them. isRazorpayConfigured() gates any live Razorpay API call at runtime.
  // RAZORPAY_KEY_ID is the publishable key (returned from the createSubscription
  // action to initialise Razorpay.js on the client) — still server-env only to
  // avoid drift; it is returned via the Server Action, NOT via NEXT_PUBLIC_.
  // RAZORPAY_KEY_SECRET and RAZORPAY_WEBHOOK_SECRET are secrets and must never
  // reach the browser or appear in NEXT_PUBLIC_* vars.
  // RAZORPAY_PRO_PLAN_ID has been removed (AP-46 revision): the active plan id
  // is now sourced from the `plans` DB catalog table for full price-change audit.
  RAZORPAY_KEY_ID: z.string().min(1).optional(),
  RAZORPAY_KEY_SECRET: z.string().min(1).optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1).optional(),
});

function parseEnv<T extends z.ZodTypeAny>(
  schema: T,
  source: Record<string, string | undefined>,
): z.infer<T> {
  const result = schema.safeParse(source);
  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Environment validation failed:\n${formatted}`);
  }
  return result.data;
}

export const serverEnv = parseEnv(serverSchema, {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
  WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
  WHATSAPP_TEMPLATE_NAME: process.env.WHATSAPP_TEMPLATE_NAME,
  WHATSAPP_API_VERSION: process.env.WHATSAPP_API_VERSION,
  WHATSAPP_APP_SECRET: process.env.WHATSAPP_APP_SECRET,
  WHATSAPP_WEBHOOK_VERIFY_TOKEN: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  RESEND_WEBHOOK_SECRET: process.env.RESEND_WEBHOOK_SECRET,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
});

export type ServerEnv = typeof serverEnv;

/**
 * Returns true when all three required WhatsApp Cloud API credentials are
 * present. When false, sendInvoice skips the live HTTP call and records a
 * 'skipped' message_log row instead — this is the expected path in dev/CI
 * before WABA credentials are provisioned.
 */
export function isWhatsAppConfigured(): boolean {
  return Boolean(
    serverEnv.WHATSAPP_PHONE_NUMBER_ID &&
    serverEnv.WHATSAPP_ACCESS_TOKEN &&
    serverEnv.WHATSAPP_TEMPLATE_NAME,
  );
}

/**
 * Returns true when both webhook secrets are present. When false, the webhook
 * route skips signature verification and returns a benign 503 — this is the
 * expected path in dev/CI before WABA credentials are provisioned (AP-26).
 */
export function isWhatsAppWebhookConfigured(): boolean {
  return Boolean(serverEnv.WHATSAPP_APP_SECRET && serverEnv.WHATSAPP_WEBHOOK_VERIFY_TOKEN);
}

/**
 * Returns true when both required Resend credentials are present (RESEND_API_KEY
 * and EMAIL_FROM). When false, sendInvoiceEmail skips the live HTTP call and
 * records a 'skipped' message_log row instead — this is the expected dev/CI path
 * before Resend account + domain are provisioned (AP-28).
 */
export function isEmailConfigured(): boolean {
  return Boolean(serverEnv.RESEND_API_KEY && serverEnv.EMAIL_FROM);
}

/**
 * Returns true when the Resend webhook signing secret is present. When false,
 * the email webhook route returns a benign skip response — expected in dev/CI
 * before the Resend webhook is registered (AP-28).
 */
export function isEmailWebhookConfigured(): boolean {
  return Boolean(serverEnv.RESEND_WEBHOOK_SECRET);
}

/**
 * Returns true when the three required Razorpay env credentials are present:
 * RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET.
 *
 * "Configured" means keys/secret are present. The active plan_id is NOT
 * checked here because it lives in the `plans` DB catalog table, not in env.
 * createSubscription() layers that DB check on top: if no active pro plan row
 * exists or its razorpay_plan_id is null, it returns {ok:false} fail-closed
 * regardless of this flag.
 *
 * When false, createSubscription returns a fail-closed error and the webhook
 * route skips processing — expected in dev/CI before credentials are
 * provisioned (AP-46 revision).
 */
export function isRazorpayConfigured(): boolean {
  return Boolean(
    serverEnv.RAZORPAY_KEY_ID && serverEnv.RAZORPAY_KEY_SECRET && serverEnv.RAZORPAY_WEBHOOK_SECRET,
  );
}
