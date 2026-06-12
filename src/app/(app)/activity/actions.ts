"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import logger from "@/lib/logger";

export type NotificationActionResult = { ok: true } | { ok: false; error: string };

const UuidSchema = z.string().uuid("Notification id must be a valid UUID");

export async function markAllNotificationsRead(): Promise<NotificationActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  if (error) {
    logger.error({ err: { code: error.code } }, "markAllNotificationsRead: update failed");
    return { ok: false, error: "Failed to mark notifications as read. Please try again." };
  }

  revalidatePath("/activity");
  return { ok: true };
}

export async function markNotificationRead(id: string): Promise<NotificationActionResult> {
  const parsed = UuidSchema.safeParse(id);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid notification id" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", parsed.data)
    .eq("user_id", user.id);

  if (error) {
    logger.error({ err: { code: error.code } }, "markNotificationRead: update failed");
    return { ok: false, error: "Failed to mark notification as read. Please try again." };
  }

  revalidatePath("/activity");
  return { ok: true };
}
