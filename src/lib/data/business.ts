import "server-only";

import { createClient } from "@/lib/supabase/server";
import logger from "@/lib/logger";
import type { Tables } from "@/lib/types/database";

export type Business = Tables<"businesses">;

/**
 * Returns the current authenticated user's business row, or null if none exists.
 *
 * Uses the RLS-scoped server client — the businesses SELECT policy restricts
 * results to rows the caller is a member of, so a single row is expected.
 * Returns null both when unauthenticated and when the user has no business.
 *
 * Server-only: never import this in a Client Component.
 */
export async function getBusinessForUser(): Promise<Business | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("businesses").select("*").single();

  if (error) {
    // PGRST116 = "no rows returned" — expected for users without a business
    if (error.code !== "PGRST116") {
      logger.error({ err: error }, "getBusinessForUser: query failed");
    }
    return null;
  }

  return data;
}

export interface BusinessGstContext {
  gstEnabled: boolean;
  stateCode: string | null;
}

/**
 * Returns the minimal GST context needed to compute invoice preview totals
 * with the same flags the server action uses.
 *
 * Fetches only gst_enabled + state_code — avoids over-selecting the full row
 * when the caller only needs GST flags (e.g. invoice create/edit containers).
 *
 * Server-only: never import this in a Client Component.
 */
export async function getBusinessGstContext(): Promise<BusinessGstContext | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("businesses")
    .select("gst_enabled, state_code")
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      logger.error({ err: { code: error.code } }, "getBusinessGstContext: query failed");
    }
    return null;
  }

  return {
    gstEnabled: data.gst_enabled ?? false,
    stateCode: data.state_code ?? null,
  };
}
