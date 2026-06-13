import "server-only";

import { createClient } from "@/lib/supabase/server";
import logger from "@/lib/logger";

export type Plan = "free" | "pro";

/**
 * Resolves the plan for a given businessId, or — when businessId is omitted —
 * looks it up from the caller's session via business_members.
 *
 * Returns 'free' as a safe default on any lookup failure (fail-closed: a
 * failing plan check never accidentally grants Pro access).
 */
export async function getPlan(businessId?: string): Promise<Plan> {
  const supabase = await createClient();

  let resolvedBusinessId = businessId;

  if (!resolvedBusinessId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return "free";

    const { data: member } = await supabase
      .from("business_members")
      .select("business_id")
      .eq("user_id", user.id)
      .single();

    resolvedBusinessId = member?.business_id ?? undefined;
  }

  if (!resolvedBusinessId) return "free";

  const { data: biz, error } = await supabase
    .from("businesses")
    .select("plan")
    .eq("id", resolvedBusinessId)
    .single();

  if (error) {
    logger.error({ err: { code: error.code, message: error.message } }, "getPlan: lookup failed");
    return "free";
  }

  return biz?.plan === "pro" ? "pro" : "free";
}

export async function isPro(businessId?: string): Promise<boolean> {
  return (await getPlan(businessId)) === "pro";
}
