import "server-only";

import { createClient } from "@/lib/supabase/server";
import logger from "@/lib/logger";
import { formatPaise } from "@/lib/utils";
import type { Invoice } from "@/lib/types";
import type { StatusPillStatus } from "@/components/ui/custom/status-pill";
import type { DashboardSummary } from "@/lib/types/dashboard";
import { ZERO_DASHBOARD_SUMMARY } from "@/lib/types/dashboard";

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function toInt(v: unknown, fallback = 0): number {
  return typeof v === "number" ? v : fallback;
}

function parseStatusCounts(raw: unknown): DashboardSummary["status_counts"] {
  if (!isRecord(raw)) return { ...ZERO_DASHBOARD_SUMMARY.status_counts };
  return {
    draft: toInt(raw.draft),
    sent: toInt(raw.sent),
    viewed: toInt(raw.viewed),
    partial: toInt(raw.partial),
    pending: toInt(raw.pending),
    paid: toInt(raw.paid),
    overdue: toInt(raw.overdue),
    cancelled: toInt(raw.cancelled),
  };
}

function parseDashboardSummary(raw: unknown): DashboardSummary {
  if (!isRecord(raw)) return { ...ZERO_DASHBOARD_SUMMARY };
  return {
    outstanding_amount: toInt(raw.outstanding_amount),
    outstanding_count: toInt(raw.outstanding_count),
    overdue_amount: toInt(raw.overdue_amount),
    overdue_count: toInt(raw.overdue_count),
    paid_this_month: toInt(raw.paid_this_month),
    status_counts: parseStatusCounts(raw.status_counts),
  };
}

const UI_STATUSES = new Set<string>([
  "draft",
  "sent",
  "viewed",
  "partial",
  "pending",
  "paid",
  "overdue",
]);

function toUiStatus(dbStatus: string): StatusPillStatus | null {
  if (UI_STATUSES.has(dbStatus)) return dbStatus as StatusPillStatus;
  return null;
}

async function resolveBusinessId(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: member } = await supabase
    .from("business_members")
    .select("business_id")
    .eq("user_id", user.id)
    .single();

  return member?.business_id ?? null;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = await createClient();

  const businessId = await resolveBusinessId(supabase);
  if (!businessId) return { ...ZERO_DASHBOARD_SUMMARY };

  const { data, error } = await supabase.rpc("dashboard_summary", {
    p_business_id: businessId,
  });

  if (error) {
    logger.error(
      { err: { code: error.code, message: error.message } },
      "getDashboardSummary: RPC failed",
    );
    return { ...ZERO_DASHBOARD_SUMMARY };
  }

  return parseDashboardSummary(data);
}

const RECENT_LIMIT = 20;

export async function getRecentInvoices(): Promise<ReadonlyArray<Invoice>> {
  const supabase = await createClient();

  const businessId = await resolveBusinessId(supabase);
  if (!businessId) return [];

  const { data, error } = await supabase
    .from("invoices")
    .select("id, number, issue_date, total, status, customers ( name, city )")
    .eq("business_id", businessId)
    .neq("status", "cancelled")
    .order("issue_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(RECENT_LIMIT);

  if (error) {
    logger.error(
      { err: { code: error.code, message: error.message } },
      "getRecentInvoices: query failed",
    );
    return [];
  }

  return (data ?? []).flatMap((row) => {
    const uiStatus = toUiStatus(row.status);
    if (!uiStatus) return [];

    const customer = Array.isArray(row.customers) ? row.customers[0] : row.customers;
    const displayId = row.number ? `#${row.number}` : `#${row.id.slice(0, 8).toUpperCase()}`;

    const invoice: Invoice = {
      id: displayId,
      invoiceUuid: row.id,
      customer: customer?.name ?? "Unknown",
      city: customer?.city ?? "",
      isoDate: row.issue_date,
      amount: formatPaise(row.total),
      status: uiStatus,
    };

    return [invoice];
  });
}
