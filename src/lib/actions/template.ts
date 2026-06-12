"use server";

import { createClient } from "@/lib/supabase/server";
import { TemplateSchema } from "@/lib/schema/template";
import { getBusinessId } from "@/lib/actions/business";
import logger from "@/lib/logger";
import type { TablesUpdate } from "@/lib/types/database";

export type UpdateInvoiceTemplateResult = { ok: true } | { ok: false; error: string };

export async function updateInvoiceTemplate(input: {
  accentColor: string;
  footerMessage: string;
}): Promise<UpdateInvoiceTemplateResult> {
  const parsed = TemplateSchema.safeParse(input);
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
    accent_color: parsed.data.accentColor,
    footer_message: parsed.data.footerMessage,
  };

  const { error } = await supabase.from("businesses").update(patch).eq("id", businessId);

  if (error) {
    logger.error({ err: { code: error.code } }, "updateInvoiceTemplate: update failed");
    return { ok: false, error: "Failed to save invoice template. Please try again." };
  }

  return { ok: true };
}
