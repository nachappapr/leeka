"use server";

import { createClient } from "@/lib/supabase/server";
import { ProfileStepSchema } from "@/lib/schema/profile";
import logger from "@/lib/logger";
import type { AuthActionResult } from "@/lib/types/auth";

/**
 * Persists the authenticated user's display_name from the AP-5 profile step.
 *
 * - Validates input with the shared ProfileStepSchema before touching Supabase.
 * - Uses the RLS-scoped server client (anon key + session cookie) — never the
 *   admin/service-role client. The RLS update policy limits the write to the
 *   row where id = auth.uid(), so no user can overwrite another's row.
 * - Rejects unauthenticated callers cleanly (no session → getUser returns null).
 * - Only display_name is accepted; phone/id/language are never read from the caller.
 */
export async function saveDisplayName(displayName: string): Promise<AuthActionResult> {
  // 1. Input validation — runs before any Supabase call
  const parsed = ProfileStepSchema.safeParse({ displayName });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();

  // 2. Auth check — reject unauthenticated callers cleanly
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  // 3. Persist display_name for the current user only.
  //    RLS policy "profiles: owner can update" enforces id = auth.uid() server-side.
  //    We never accept id/phone/language from the caller.
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: parsed.data.displayName })
    .eq("id", user.id);

  if (error) {
    logger.error({ err: error }, "saveDisplayName: update failed");
    return { ok: false, error: "Failed to save display name" };
  }

  return { ok: true };
}
