import "server-only";

import { createClient } from "@/lib/supabase/server";
import logger from "@/lib/logger";
import type {
  NotificationGroupData,
  NotificationItemData,
  NotificationTone,
} from "@/lib/types/notifications";

const PANEL_LIMIT = 30;

function toTone(type: string): NotificationTone {
  switch (type) {
    case "invoice_paid":
      return "paid";
    case "invoice_viewed":
      return "info";
    case "reminder_sent":
      return "whatsapp";
    case "email_bounced":
      return "overdue";
    default:
      return "info";
  }
}

function toVerb(type: string, body: string | null): string {
  switch (type) {
    case "invoice_paid":
      return "paid invoice";
    case "invoice_viewed":
      return "viewed invoice";
    case "reminder_sent":
      return "was sent a reminder for";
    case "email_bounced":
      return "email bounced on";
    default:
      return body ?? "activity on";
  }
}

type MetaShape = {
  invoice_number?: string;
  amount?: number;
  customer?: string;
  [key: string]: unknown;
};

function safeMeta(raw: unknown): MetaShape {
  if (raw !== null && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as MetaShape;
  }
  return {};
}

function isToday(ts: string): boolean {
  const d = new Date(ts);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export async function getNotificationGroups(): Promise<NotificationGroupData[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, title, body, link, read, created_at, meta")
    .order("created_at", { ascending: false })
    .limit(PANEL_LIMIT);

  if (error) {
    logger.error(
      { err: { code: error.code, message: error.message } },
      "getNotificationGroups: query failed",
    );
    return [];
  }

  const rows = data ?? [];

  const todayItems: NotificationItemData[] = [];
  const earlierItems: NotificationItemData[] = [];

  for (const row of rows) {
    const meta = safeMeta(row.meta);
    const createdAt = row.created_at ?? new Date().toISOString();

    const amountRaw = typeof meta.amount === "number" ? meta.amount : undefined;
    const amount = amountRaw !== undefined ? amountRaw / 100 : undefined;

    const item: NotificationItemData = {
      id: row.id,
      customer: (typeof meta.customer === "string" && meta.customer) || row.title || "Unknown",
      verb: toVerb(row.type, row.body),
      tone: toTone(row.type),
      timestamp: createdAt,
      unread: !row.read,
      href: row.link ?? undefined,
      invoiceNo: typeof meta.invoice_number === "string" ? meta.invoice_number : undefined,
      amount,
    };

    if (isToday(createdAt)) {
      todayItems.push(item);
    } else {
      earlierItems.push(item);
    }
  }

  const groups: NotificationGroupData[] = [];

  if (todayItems.length > 0) {
    groups.push({ id: "today", label: "Today", items: todayItems });
  }
  if (earlierItems.length > 0) {
    groups.push({ id: "earlier", label: "Earlier", items: earlierItems });
  }

  return groups;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("read", false);

  if (error) {
    logger.error(
      { err: { code: error.code, message: error.message } },
      "getUnreadNotificationCount: count query failed",
    );
    return 0;
  }

  return count ?? 0;
}
