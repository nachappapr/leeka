import "server-only";

import { createClient } from "@/lib/supabase/server";
import logger from "@/lib/logger";
import type { ReportsMetrics, ReportsMonthPoint, ReportsSummary } from "@/lib/types/reports";
import type { Json } from "@/lib/types/database";

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function isNumberOrNull(v: unknown): v is number | null {
  return v === null || typeof v === "number";
}

function parseMonths(raw: unknown): ReportsMonthPoint[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (!isRecord(item)) return [];
    const { month, revenue, received } = item;
    if (typeof month !== "string" || typeof revenue !== "number" || typeof received !== "number") {
      return [];
    }
    return [{ month, revenue, received }];
  });
}

function parseSummary(raw: unknown): ReportsSummary {
  if (!isRecord(raw)) {
    return {
      revenue: 0,
      received: 0,
      invoice_count: 0,
      avg_invoice_value: 0,
      avg_days_to_pay: null,
    };
  }
  const { revenue, received, invoice_count, avg_invoice_value, avg_days_to_pay } = raw;
  return {
    revenue: typeof revenue === "number" ? revenue : 0,
    received: typeof received === "number" ? received : 0,
    invoice_count: typeof invoice_count === "number" ? invoice_count : 0,
    avg_invoice_value: typeof avg_invoice_value === "number" ? avg_invoice_value : 0,
    avg_days_to_pay: isNumberOrNull(avg_days_to_pay) ? avg_days_to_pay : null,
  };
}

function parseRpcResult(raw: Json): ReportsMetrics {
  if (!isRecord(raw)) {
    return { months: [], summary: parseSummary(null) };
  }
  return {
    months: parseMonths(raw.months),
    summary: parseSummary(raw.summary),
  };
}

/**
 * Fetches reports metrics for the signed-in user's business over [from, to].
 *
 * Resolves the active business_id from business_members (same pattern as
 * customer-detail-container). Returns null when the user has no business or
 * the RPC call fails.
 */
export async function getReportsMetrics(from: string, to: string): Promise<ReportsMetrics | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: member } = await supabase
    .from("business_members")
    .select("business_id")
    .eq("user_id", user.id)
    .single();

  const businessId = member?.business_id;
  if (!businessId) return null;

  const { data, error } = await supabase.rpc("get_reports_metrics", {
    p_business_id: businessId,
    p_from: from,
    p_to: to,
  });

  if (error) {
    logger.error(
      { err: { code: error.code, message: error.message } },
      "getReportsMetrics: RPC failed",
    );
    return null;
  }

  if (data === null) return null;

  return parseRpcResult(data);
}
