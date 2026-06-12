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
