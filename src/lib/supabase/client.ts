import { createBrowserClient } from "@supabase/ssr";
import { clientEnv } from "@/lib/env.client";
import type { Database } from "@/lib/types/database";

/**
 * Browser-side Supabase client — for use in Client Components only.
 * Uses the publishable (anon) key. Never import this in Server Components
 * or Route Handlers; use createClient() from @/lib/supabase/server instead.
 */
export function createClient() {
  return createBrowserClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
