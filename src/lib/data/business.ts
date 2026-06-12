import "server-only";

import { createClient } from "@/lib/supabase/server";
import logger from "@/lib/logger";
import type { Tables } from "@/lib/types/database";

/** Signed-URL TTL for business logos (1 hour). */
const LOGO_SIGNED_URL_EXPIRY_SECONDS = 3600;

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

/**
 * Returns a short-lived signed URL for a business logo stored in the private
 * business-logos bucket. Returns null if the path is empty or the signing fails.
 *
 * Server-only: never import this in a Client Component.
 * The bucket is private — never construct or expose a public URL.
 */
export async function getBusinessLogoSignedUrl(path: string): Promise<string | null> {
  if (!path) return null;

  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from("business-logos")
    .createSignedUrl(path, LOGO_SIGNED_URL_EXPIRY_SECONDS);

  if (error || !data?.signedUrl) {
    logger.error({ err: { message: error?.message } }, "getBusinessLogoSignedUrl: signing failed");
    return null;
  }

  return data.signedUrl;
}

export interface BusinessGstContext {
  gstEnabled: boolean;
  stateCode: string | null;
  defaultGstRate: number;
}

export async function getBusinessGstContext(): Promise<BusinessGstContext | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("businesses")
    .select("gst_enabled, state_code, default_gst_rate")
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
    defaultGstRate: data.default_gst_rate ?? 18,
  };
}

export interface BusinessTemplate {
  accentColor: string;
  footerMessage: string;
}

export async function getBusinessTemplate(): Promise<BusinessTemplate | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("businesses")
    .select("accent_color, footer_message")
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      logger.error({ err: { code: error.code } }, "getBusinessTemplate: query failed");
    }
    return null;
  }

  return {
    accentColor: data.accent_color ?? "#F46A39",
    footerMessage: data.footer_message ?? "Thank you for your business!",
  };
}

export interface BusinessTaxDefaults {
  defaultGstRate: number;
  gstEnabled: boolean;
}

export async function getBusinessTaxDefaults(): Promise<BusinessTaxDefaults | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("businesses")
    .select("gst_enabled, default_gst_rate")
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      logger.error({ err: { code: error.code } }, "getBusinessTaxDefaults: query failed");
    }
    return null;
  }

  return {
    defaultGstRate: data.default_gst_rate ?? 18,
    gstEnabled: data.gst_enabled ?? true,
  };
}
