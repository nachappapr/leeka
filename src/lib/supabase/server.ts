import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { serverEnv } from "@/lib/env.server";
import type { Database } from "@/lib/types/database";

/**
 * Server-side Supabase client (RSC, Server Actions, Route Handlers).
 * Uses the publishable (anon) key — authenticates via cookie session.
 * Never import this in Client Components.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll called from a Server Component — safe to ignore
            // when a proxy (middleware) handles session refresh.
          }
        },
      },
    },
  );
}
