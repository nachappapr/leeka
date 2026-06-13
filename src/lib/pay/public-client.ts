import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { clientEnv } from "@/lib/env.client";
import type { Database } from "@/lib/types/database";

/**
 * Cookie-less anonymous Supabase client for the public pay surface.
 * Uses only NEXT_PUBLIC_ vars so this module is safe to call from a
 * Server Component that carries no session — enabling ISR/edge caching.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false } },
  );
}
