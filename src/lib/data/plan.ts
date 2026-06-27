import "server-only";

import { createClient } from "@/lib/supabase/server";
import logger from "@/lib/logger";
import { isAbortError } from "@/lib/supabase/is-abort-error";
import type { Tables } from "@/lib/types/database";

export type PlanRow = Pick<Tables<"plans">, "amount_inr" | "billing_period">;

/**
 * Returns the active pro plan row from the plans catalog, or null if none is
 * found. Callers must handle the null case defensively — the seeded row should
 * always exist, but a missing row must never crash the settings page.
 *
 * RLS on plans grants SELECT to the authenticated role only; anon access is
 * explicitly denied. createClient() carries the cookie-session JWT that
 * elevates the request to authenticated. This reader is only called from the
 * auth-gated settings page, so the session is guaranteed present. Server-only.
 */
export async function getActiveProPlan(): Promise<PlanRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("plans")
    .select("amount_inr, billing_period")
    .eq("code", "pro")
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code !== "PGRST116" && !isAbortError(error)) {
      logger.error({ err: { code: error.code } }, "getActiveProPlan: query failed");
    }
    return null;
  }

  return data;
}
