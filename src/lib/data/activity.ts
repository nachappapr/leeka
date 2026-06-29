import "server-only";

import { createClient } from "@/lib/supabase/server";
import logger from "@/lib/logger";
import { isAbortError } from "@/lib/supabase/is-abort-error";
import { GLANCE_DEFS } from "@/lib/constants/activity";
import type { ActivityFilterId, ActivityGlanceRow } from "@/lib/types/activity";
import type {
  NotificationGroup,
  NotificationItemData,
  NotificationTone,
} from "@/lib/types/notifications";

const PAGE_SIZE = 20;

type EventType = "paid" | "viewed" | "reminder_sent";

const FILTER_TO_TYPE: Record<Exclude<ActivityFilterId, "all">, EventType> = {
  payments: "paid",
  views: "viewed",
  reminders: "reminder_sent",
};

function toEventType(filter: ActivityFilterId): EventType | null {
  if (filter === "all") return null;
  return FILTER_TO_TYPE[filter];
}

function toTone(type: string, channel: string | null): NotificationTone {
  switch (type) {
    case "paid":
      return "paid";
    case "unpaid":
      return "overdue";
    case "viewed":
      return "info";
    case "reminder_sent":
      return channel === "whatsapp" ? "whatsapp" : "sent";
    default:
      return "info";
  }
}

function toVerb(type: string): string {
  switch (type) {
    case "paid":
      return "paid invoice";
    case "unpaid":
      return "marked unpaid";
    case "viewed":
      return "viewed invoice";
    case "reminder_sent":
      return "was sent a reminder for";
    default:
      return "activity on";
  }
}

/*
 * Assigns a chronological group label based on how far in the past the event
 * was created. Groups mirror the ACTIVITY_GROUP_ORDER constant.
 */
function toGroup(createdAt: string): NotificationGroup {
  const now = new Date();
  const then = new Date(createdAt);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

  if (then >= todayStart) return "today";
  if (then >= yesterdayStart) return "yesterday";
  if (diffDays <= 7) return "week";
  return "earlier";
}

type MetaShape = {
  invoice_number?: string;
  total?: number;
  [key: string]: unknown;
};

function safeMeta(raw: unknown): MetaShape {
  if (raw !== null && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as MetaShape;
  }
  return {};
}

export interface ActivityEventsResult {
  items: NotificationItemData[];
  hasNextPage: boolean;
}

export async function getActivityEvents({
  filter,
  page,
}: {
  filter: ActivityFilterId;
  page: number;
}): Promise<ActivityEventsResult> {
  const supabase = await createClient();

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE;

  const eventType = toEventType(filter);

  let query = supabase
    .from("invoice_events")
    .select("id, type, channel, meta, created_at, invoice_id, invoices(number, customers(name))")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (eventType !== null) {
    query = query.eq("type", eventType);
  }

  const { data, error } = await query;

  if (error) {
    if (!isAbortError(error)) {
      logger.error(
        { err: { code: error.code, message: error.message } },
        "getActivityEvents: query failed",
      );
    }
    return { items: [], hasNextPage: false };
  }

  const rows = data ?? [];
  const hasNextPage = rows.length > PAGE_SIZE;
  const visible = hasNextPage ? rows.slice(0, PAGE_SIZE) : rows;

  const items: NotificationItemData[] = visible.map((row) => {
    const meta = safeMeta(row.meta);

    const invoice = Array.isArray(row.invoices) ? row.invoices[0] : row.invoices;
    const customer = invoice
      ? Array.isArray(invoice.customers)
        ? invoice.customers[0]
        : invoice.customers
      : null;

    const customerName = customer?.name ?? "Unknown";
    const invoiceNo =
      typeof meta.invoice_number === "string"
        ? meta.invoice_number
        : (invoice?.number ?? undefined);

    const amountPaise = typeof meta.total === "number" ? meta.total : undefined;
    const amount = amountPaise !== undefined ? amountPaise / 100 : undefined;

    const createdAt = row.created_at ?? new Date().toISOString();

    return {
      id: row.id,
      customer: customerName,
      verb: toVerb(row.type),
      tone: toTone(row.type, row.channel),
      timestamp: createdAt,
      group: toGroup(createdAt),
      invoiceNo,
      amount,
      href: row.invoice_id ? `/invoices/${row.invoice_id}` : undefined,
    };
  });

  return { items, hasNextPage };
}

export async function getActivityGlanceCounts(): Promise<ActivityGlanceRow[]> {
  const supabase = await createClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const results = await Promise.all(
    GLANCE_DEFS.map(async (def) => {
      const { count, error } = await supabase
        .from("invoice_events")
        .select("id", { count: "exact", head: true })
        .eq("type", def.eventType)
        .gte("created_at", monthStart);

      if (error) {
        if (!isAbortError(error)) {
          logger.error(
            { err: { code: error.code, message: error.message } },
            "getActivityGlanceCounts: count query failed",
          );
        }
        return { label: def.label, tone: def.tone, count: 0 };
      }

      return { label: def.label, tone: def.tone, count: count ?? 0 };
    }),
  );

  return results;
}
