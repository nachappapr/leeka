"use server";

import { createClient } from "@/lib/supabase/server";
import { BusinessSchema } from "@/lib/schema/business";
import logger from "@/lib/logger";

export type CreateBusinessResult = { ok: true; businessId: string } | { ok: false; error: string };

/**
 * Creates a new business for the authenticated user via the `create_business` RPC.
 *
 * - Validates all inputs with BusinessSchema before touching Supabase.
 * - Rejects unauthenticated callers cleanly (no session → getUser returns null).
 * - Calls the security-definer RPC which atomically inserts businesses +
 *   business_members rows, bypassing the chicken-and-egg RLS issue.
 * - Returns { ok: true, businessId } on success or { ok: false, error } on failure.
 * - Never logs PII (GSTIN, address) — only safe identifiers / generic messages.
 */
export async function createBusiness(input: {
  name: string;
  address?: string;
  stateCode?: string;
  gstin?: string;
  upiId?: string;
}): Promise<CreateBusinessResult> {
  // 1. Input validation — runs before any Supabase call
  const parsed = BusinessSchema.safeParse(input);
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

  const { name, address, stateCode, gstin, upiId } = parsed.data;

  // 3. Call security-definer RPC — passes empty string for unset optional fields;
  //    the RPC coerces empty strings to NULL via nullif(trim(...), '').
  const { data, error } = await supabase.rpc("create_business", {
    p_name: name,
    p_address: address ?? "",
    p_state_code: stateCode ?? "",
    p_gstin: gstin ?? "",
    p_upi_id: upiId ?? "",
  });

  if (error) {
    // Surface structured exception codes from the RPC
    if (error.message.includes("ALREADY_HAS_BUSINESS")) {
      return { ok: false, error: "You already have a business registered." };
    }
    if (error.message.includes("NAME_REQUIRED")) {
      return { ok: false, error: "Business name is required." };
    }
    logger.error({ err: { code: error.code }, userId: user.id }, "createBusiness: RPC failed");
    return { ok: false, error: "Failed to create business. Please try again." };
  }

  return { ok: true, businessId: data as string };
}
