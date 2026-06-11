"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ItemSchema } from "@/lib/schema/item";
import logger from "@/lib/logger";
import type { SavedItem } from "@/lib/types/item";

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
