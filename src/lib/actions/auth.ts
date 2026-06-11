"use server";

import { createClient } from "@/lib/supabase/server";
import { validPhone, toE164 } from "@/lib/utils/auth-phone";
import { getProfile } from "@/lib/data/profile";
import type { AuthActionResult } from "@/lib/types/auth";

export async function sendOtp(phone: string): Promise<AuthActionResult> {
  if (!validPhone(phone)) {
    return { ok: false, error: "Invalid phone number" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    phone: toE164(phone),
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function verifyOtp(phone: string, token: string): Promise<AuthActionResult> {
  if (!validPhone(phone)) {
    return { ok: false, error: "Invalid phone number" };
  }
  if (!/^\d{6}$/.test(token)) {
    return { ok: false, error: "Invalid code" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    phone: toE164(phone),
    token,
    type: "sms",
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const profile = await getProfile();
  const profileComplete =
    typeof profile?.display_name === "string" && profile.display_name.trim().length > 0;

  return { ok: true, profileComplete };
}
