import type { ExportDateRangeId, ExportStatusId } from "@/lib/types/invoice-export";

/**
 * Returns the current Indian Financial Year boundaries.
 * Indian FY runs Apr 1 → Mar 31.
 * E.g. on 2026-06-12 → { start: "2026-04-01", end: "2027-03-31" }
 */
export function currentIndianFY(): { start: string; end: string; label: string } {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed; April = 3

  // FY starts in April (month 3). If we're in Jan–Mar, FY started last year.
  const fyStart = month >= 3 ? year : year - 1;
  const fyEnd = fyStart + 1;

  return {
    start: `${fyStart}-04-01`,
    end: `${fyEnd}-03-31`,
    label: `FY ${fyStart}–${String(fyEnd).slice(2)}`,
  };
}

interface BuildExportUrlArgs {
  statuses: ReadonlyArray<ExportStatusId>;
  range: ExportDateRangeId;
  from: string;
  to: string;
  customer: string;
}

/**
 * Builds the CSV export endpoint URL from the modal's filter state.
 * Returns the full path (e.g. "/api/invoices/export/csv?statuses=paid,sent").
 *
 * Rules:
 * - statuses: omit when ["all"]; else comma-joined.
 * - date range: this-month/last-month/this-quarter/fy → computed from/to;
 *   "all" → omit both; "custom" → use the from/to inputs as-is (omit empty ones).
 * - customer: omit when "all", else exact name.
 * All values are encodeURIComponent-encoded.
 */
export function buildExportUrl({
  statuses,
  range,
  from,
  to,
  customer,
}: BuildExportUrlArgs): string {
  const params = new URLSearchParams();

  if (!statuses.includes("all")) {
    params.set("statuses", statuses.join(","));
  }

  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const isoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (range === "this-month") {
    const y = today.getFullYear();
    const m = today.getMonth();
    params.set("from", `${y}-${pad(m + 1)}-01`);
    const lastDay = new Date(y, m + 1, 0);
    params.set("to", isoDate(lastDay));
  } else if (range === "last-month") {
    const d = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    params.set("from", `${y}-${pad(m + 1)}-01`);
    const lastDay = new Date(y, m + 1, 0);
    params.set("to", isoDate(lastDay));
  } else if (range === "this-quarter") {
    const m = today.getMonth(); // 0-indexed
    // Q1: Jan–Mar (0–2), Q2: Apr–Jun (3–5), Q3: Jul–Sep (6–8), Q4: Oct–Dec (9–11)
    const qStart = Math.floor(m / 3) * 3;
    const qEnd = qStart + 2;
    const y = today.getFullYear();
    params.set("from", `${y}-${pad(qStart + 1)}-01`);
    const lastDay = new Date(y, qEnd + 1, 0);
    params.set("to", isoDate(lastDay));
  } else if (range === "fy") {
    const fy = currentIndianFY();
    params.set("from", fy.start);
    params.set("to", fy.end);
  } else if (range === "custom") {
    if (from) params.set("from", from);
    if (to) params.set("to", to);
  }

  if (customer !== "all") {
    params.set("customer", customer);
  }

  const qs = params.toString();
  return `/api/invoices/export/csv${qs ? `?${qs}` : ""}`;
}
