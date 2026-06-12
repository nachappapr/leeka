"use server";

import { createClient } from "@/lib/supabase/server";
import { BusinessSchema } from "@/lib/schema/business";
import { TaxSchema } from "@/lib/schema/tax";
import logger from "@/lib/logger";
import { LOGO_ALLOWED_MIME_TYPES, LOGO_MAX_BYTES } from "@/lib/constants/business";
import type { TablesUpdate } from "@/lib/types/database";

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

// ── Shared business_members helper ───────────────────────────────────────────

export async function getBusinessId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<string | null> {
  const { data: member } = await supabase
    .from("business_members")
    .select("business_id")
    .eq("user_id", userId)
    .single();
  return member?.business_id ?? null;
}

// ── updateBusinessProfile ─────────────────────────────────────────────────────

export type UpdateBusinessProfileResult = { ok: true } | { ok: false; error: string };

/**
 * Updates the caller's business profile fields.
 *
 * Uses the RLS-scoped server client (NOT admin) so the businesses UPDATE
 * policy enforces tenancy — only a business_member may write their own row.
 * Empty-string optionals are coerced to null before persisting.
 * Phone is READ-ONLY in this unit and is sourced from profiles — do not pass it here.
 */
export async function updateBusinessProfile(input: {
  name: string;
  address?: string;
  stateCode?: string;
  gstin?: string;
  upiId?: string;
  logoUrl?: string;
}): Promise<UpdateBusinessProfileResult> {
  const parsed = BusinessSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const businessId = await getBusinessId(supabase, user.id);
  if (!businessId) {
    return { ok: false, error: "No business found for this account" };
  }

  const { name, address, stateCode, gstin, upiId, logoUrl } = parsed.data;

  const patch: TablesUpdate<"businesses"> = {
    name,
    address: address || null,
    gstin: gstin || null,
    upi_id: upiId || null,
  };

  if (stateCode !== undefined) {
    patch.state_code = stateCode || null;
  }

  if (logoUrl !== undefined) {
    patch.logo_url = logoUrl || null;
  }

  const { error } = await supabase.from("businesses").update(patch).eq("id", businessId);

  if (error) {
    logger.error({ err: { code: error.code } }, "updateBusinessProfile: update failed");
    return { ok: false, error: "Failed to save business profile. Please try again." };
  }

  return { ok: true };
}

// ── uploadBusinessLogo ────────────────────────────────────────────────────────

export type UploadBusinessLogoResult = { ok: true; path: string } | { ok: false; error: string };

/**
 * Accepts a file via FormData, validates type and size server-side (security
 * boundary), then uploads to the business-logos bucket at
 * "{business_id}/logo.{ext}". Returns the stored object path for the caller
 * to pass into updateBusinessProfile as logoUrl.
 *
 * Using a Server Action (not a direct client-side upload) keeps the service
 * boundary clean and ensures MIME/size validation runs server-side regardless
 * of what the client sends.
 */
export async function uploadBusinessLogo(formData: FormData): Promise<UploadBusinessLogoResult> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "No file provided" };
  }

  // Server-side type validation — security boundary, not just UX
  const allowedMimes: readonly string[] = LOGO_ALLOWED_MIME_TYPES;
  if (!allowedMimes.includes(file.type)) {
    return { ok: false, error: "File type not allowed. Use PNG, JPEG, WebP, or SVG." };
  }

  if (file.size > LOGO_MAX_BYTES) {
    return { ok: false, error: "File is too large. Maximum size is 2 MB." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const businessId = await getBusinessId(supabase, user.id);
  if (!businessId) {
    return { ok: false, error: "No business found for this account" };
  }

  // Derive extension from MIME type; svg+xml → svg
  const extMap: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/svg+xml": "svg",
  };
  const ext = extMap[file.type] ?? "bin";
  const storagePath = `${businessId}/logo.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  const { error } = await supabase.storage.from("business-logos").upload(storagePath, bytes, {
    contentType: file.type,
    upsert: true,
  });

  if (error) {
    logger.error({ err: { code: error.message } }, "uploadBusinessLogo: storage upload failed");
    return { ok: false, error: "Failed to upload logo. Please try again." };
  }

  return { ok: true, path: storagePath };
}

// ── updateTaxDefaults ─────────────────────────────────────────────────────────

export type UpdateTaxDefaultsResult = { ok: true } | { ok: false; error: string };

export async function updateTaxDefaults(input: {
  defaultGstRate: number;
  gstEnabled: boolean;
}): Promise<UpdateTaxDefaultsResult> {
  const parsed = TaxSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const businessId = await getBusinessId(supabase, user.id);
  if (!businessId) {
    return { ok: false, error: "No business found for this account" };
  }

  const patch: TablesUpdate<"businesses"> = {
    default_gst_rate: parsed.data.defaultGstRate,
    gst_enabled: parsed.data.gstEnabled,
  };

  const { error } = await supabase.from("businesses").update(patch).eq("id", businessId);

  if (error) {
    logger.error({ err: { code: error.code } }, "updateTaxDefaults: update failed");
    return { ok: false, error: "Failed to save tax defaults. Please try again." };
  }

  return { ok: true };
}
