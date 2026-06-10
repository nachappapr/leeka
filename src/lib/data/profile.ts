import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/types/database";

export type Profile = Tables<"profiles">;

/**
 * Returns the current authenticated user's profile row, or null if none exists.
 *
 * Uses the RLS-scoped server client — only the row where id = auth.uid()
 * is ever returned. Returns null both when unauthenticated and when the
 * profile row has not yet been created (race before trigger completes).
 *
 * Server-only: never import this in a Client Component.
 */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("profiles").select("*").single();

  if (error) {
    // PGRST116 = "no rows returned" — expected for new users before trigger runs
    if (error.code !== "PGRST116") {
      console.error("[getProfile] Supabase error:", error.message);
    }
    return null;
  }

  return data;
}
