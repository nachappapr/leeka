import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env.server";
import type { Database } from "@/lib/types/database";

/**
 * Service-role Supabase admin client — bypasses RLS.
 * SERVER-ONLY: Never import this in Client Components or any file
 * reachable from the browser. The service-role key must never be
 * sent to the browser or stored in NEXT_PUBLIC_* vars.
 *
 * Only use where elevated privileges are genuinely required
 * (e.g. user provisioning, background jobs, admin RPCs).
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
  );
}
