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
});

export type ServerEnv = typeof serverEnv;
