"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ItemSchema } from "@/lib/schema/item";
import logger from "@/lib/logger";
import type { SavedItem } from "@/lib/types/item";
import type { UpdateReminderSettingsResult, ReminderSettingsData } from "@/lib/types/reminders";
import type {
  GetNotificationSettingsResult,
  UpdateNotificationSettingsResult,
} from "@/lib/types/notification-settings";

export type ListItemsResult = { ok: true; data: SavedItem[] } | { ok: false; error: string };
export type UpsertItemResult = { ok: true; data: SavedItem } | { ok: false; error: string };
export type DeleteItemResult = { ok: true } | { ok: false; error: string };

async function getBusinessId(
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

export async function listItemsAction(): Promise<ListItemsResult> {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("list_items", {
    p_business_id: businessId,
    p_limit: 200,
  });

  if (error) {
    logger.error({ err: { code: error.code }, userId: user.id }, "listItemsAction: RPC failed");
    return { ok: false, error: "Failed to load items. Please try again." };
  }

  return { ok: true, data: (data as SavedItem[]) ?? [] };
}

export async function upsertItemAction(payload: {
  id?: string;
  name: string;
  hsnSac?: string;
  defaultPrice: number;
  defaultGstRate: number;
  unit?: string;
}): Promise<UpsertItemResult> {
  const parsed = ItemSchema.safeParse({
    name: payload.name,
    hsnSac: payload.hsnSac,
    defaultPrice: payload.defaultPrice,
    defaultGstRate: payload.defaultGstRate,
    unit: payload.unit,
  });

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

  const { name, hsnSac, defaultPrice, defaultGstRate, unit } = parsed.data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("upsert_item", {
    p_business_id: businessId,
    p_name: name,
    p_item_id: payload.id ?? undefined,
    p_hsn_sac: hsnSac ?? null,
    p_default_price: defaultPrice,
    p_default_gst_rate: defaultGstRate,
    p_unit: unit ?? null,
  });

  if (error) {
    logger.error({ err: { code: error.code }, userId: user.id }, "upsertItemAction: RPC failed");
    return { ok: false, error: "Failed to save item. Please try again." };
  }

  return { ok: true, data: data as SavedItem };
}

// ── updateReminderSettings ────────────────────────────────────────────────────

const UpdateReminderSettingsSchema = z.object({
  enabled: z.boolean(),
  offsets: z
    .array(z.number().int().min(0).max(60))
    .min(1, "At least one offset is required")
    .max(6, "At most 6 offsets are allowed")
    .refine((arr) => new Set(arr).size === arr.length, "Offsets must be unique"),
  channel: z.enum(["whatsapp", "email"]),
});

/**
 * updateReminderSettings — AP-30 Server Action.
 *
 * Persists reminder_rules for the caller's business via the RLS-scoped server
 * client (NOT admin) so member RLS enforces tenancy without bypassing it.
 *
 * Pro gate: enabling reminders (enabled=true) requires plan='pro'. Saving
 * offsets or disabling while on the free plan is allowed — the gate is
 * intentionally narrow so non-Pro businesses can configure offsets in advance.
 *
 * The cron re-checks plan+enabled at run time (defence in depth) — even if
 * this guard were bypassed, claim_due_reminders joins businesses.plan='pro'
 * and reminder_rules.enabled=true before claiming any row.
 *
 * Offsets are deduplicated and sorted ascending before persisting.
 */
export async function updateReminderSettings(
  payload: unknown,
): Promise<UpdateReminderSettingsResult> {
  const parsed = UpdateReminderSettingsSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid reminder settings" };
  }

  const { enabled, channel } = parsed.data;
  const offsets = [...new Set(parsed.data.offsets)].sort((a, b) => a - b);

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

  if (enabled) {
    const { data: bizRow, error: bizErr } = await supabase
      .from("businesses")
      .select("plan")
      .eq("id", businessId)
      .single();

    if (bizErr || !bizRow) {
      logger.error(
        { err: { code: bizErr?.code } },
        "updateReminderSettings: failed to fetch business plan",
      );
      return { ok: false, error: "Failed to load business settings. Please try again." };
    }

    if (bizRow.plan !== "pro") {
      return { ok: false, error: "Auto reminders are a Pro feature" };
    }
  }

  const { data: upserted, error: upsertErr } = await supabase
    .from("reminder_rules")
    .upsert(
      { business_id: businessId, enabled, offsets_days: offsets, channel },
      { onConflict: "business_id" },
    )
    .select("enabled, offsets_days, channel")
    .single();

  if (upsertErr || !upserted) {
    logger.error({ err: { code: upsertErr?.code } }, "updateReminderSettings: upsert failed");
    return { ok: false, error: "Failed to save reminder settings. Please try again." };
  }

  return {
    ok: true,
    data: {
      enabled: upserted.enabled,
      offsets: upserted.offsets_days,
      channel: upserted.channel as "whatsapp" | "email",
    },
  };
}

// ── getReminderSettings ───────────────────────────────────────────────────────

export type GetReminderSettingsResult =
  | { ok: true; data: ReminderSettingsData }
  | { ok: false; error: string };

/**
 * getReminderSettings — AP-30 read action.
 *
 * Reads the business's reminder_rules row via the RLS-scoped server client.
 * Returns defaults { enabled:false, offsets:[0,3,7], channel:"whatsapp" }
 * when no row exists (first visit before any save).
 */
export async function getReminderSettings(): Promise<GetReminderSettingsResult> {
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

  const { data, error } = await supabase
    .from("reminder_rules")
    .select("enabled, offsets_days, channel")
    .eq("business_id", businessId)
    .maybeSingle();

  if (error) {
    logger.error({ err: { code: error.code } }, "getReminderSettings: query failed");
    return { ok: false, error: "Failed to load reminder settings." };
  }

  if (!data) {
    return {
      ok: true,
      data: { enabled: false, offsets: [0, 3, 7], channel: "whatsapp" },
    };
  }

  return {
    ok: true,
    data: {
      enabled: data.enabled,
      offsets: data.offsets_days,
      channel: data.channel as "whatsapp" | "email",
    },
  };
}

// ── getNotificationSettings ───────────────────────────────────────────────────

/**
 * getNotificationSettings — AP-39 read action.
 *
 * Reads the business's notification_settings row via the RLS-scoped server
 * client. Returns defaults { waReceipts:true, pushViewed:true, pushPaid:true,
 * dailyEmail:false } when no row exists (first visit before any save).
 */
export async function getNotificationSettings(): Promise<GetNotificationSettingsResult> {
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

  const { data, error } = await supabase
    .from("notification_settings")
    .select("wa_delivery_receipts, push_invoice_viewed, push_payment_received, daily_summary_email")
    .eq("business_id", businessId)
    .maybeSingle();

  if (error) {
    logger.error({ err: { code: error.code } }, "getNotificationSettings: query failed");
    return { ok: false, error: "Failed to load notification settings." };
  }

  if (!data) {
    return {
      ok: true,
      data: { waReceipts: true, pushViewed: true, pushPaid: true, dailyEmail: false },
    };
  }

  return {
    ok: true,
    data: {
      waReceipts: data.wa_delivery_receipts,
      pushViewed: data.push_invoice_viewed,
      pushPaid: data.push_payment_received,
      dailyEmail: data.daily_summary_email,
    },
  };
}

// ── updateNotificationSettings ────────────────────────────────────────────────

const UpdateNotificationSettingsSchema = z
  .object({
    waReceipts: z.boolean(),
    pushViewed: z.boolean(),
    pushPaid: z.boolean(),
    dailyEmail: z.boolean(),
  })
  .strict();

/**
 * updateNotificationSettings — AP-39 Server Action.
 *
 * Persists the four notification channel toggles for the caller's business via
 * the RLS-scoped server client (NOT admin) so member RLS enforces tenancy.
 * No Pro gating — these toggles are available to all plans.
 *
 * Upserts on business_id conflict; updated_at is refreshed via the column
 * default on INSERT and set explicitly on UPDATE.
 */
export async function updateNotificationSettings(
  payload: unknown,
): Promise<UpdateNotificationSettingsResult> {
  const parsed = UpdateNotificationSettingsSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid notification settings",
    };
  }

  const { waReceipts, pushViewed, pushPaid, dailyEmail } = parsed.data;

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

  const { data: upserted, error: upsertErr } = await supabase
    .from("notification_settings")
    .upsert(
      {
        business_id: businessId,
        wa_delivery_receipts: waReceipts,
        push_invoice_viewed: pushViewed,
        push_payment_received: pushPaid,
        daily_summary_email: dailyEmail,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "business_id" },
    )
    .select("wa_delivery_receipts, push_invoice_viewed, push_payment_received, daily_summary_email")
    .single();

  if (upsertErr || !upserted) {
    logger.error({ err: { code: upsertErr?.code } }, "updateNotificationSettings: upsert failed");
    return { ok: false, error: "Failed to save notification settings. Please try again." };
  }

  return {
    ok: true,
    data: {
      waReceipts: upserted.wa_delivery_receipts,
      pushViewed: upserted.push_invoice_viewed,
      pushPaid: upserted.push_payment_received,
      dailyEmail: upserted.daily_summary_email,
    },
  };
}

export async function deleteItemAction(itemId: string): Promise<DeleteItemResult> {
  const idParsed = z.string().uuid("Invalid item ID").safeParse(itemId);
  if (!idParsed.success) {
    return { ok: false, error: idParsed.error.issues[0]?.message ?? "Invalid item ID" };
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("delete_item", {
    p_business_id: businessId,
    p_item_id: idParsed.data,
  });

  if (error) {
    logger.error({ err: { code: error.code }, userId: user.id }, "deleteItemAction: RPC failed");
    return { ok: false, error: "Failed to delete item. Please try again." };
  }

  return { ok: true };
}
