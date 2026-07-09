import type { ReportsMonthPoint } from "@/lib/types/reports";

export interface ReportsChartDatum {
  month: string;
  label: string;
  revenue: number;
  received: number;
}

/** Format a `YYYY-MM` month key as a short en-IN chart label, e.g. "Jul 26". */
export function formatChartMonthLabel(yyyyMM: string): string {
  const [year, month] = yyyyMM.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}

/** Format an integer paise value as a ₹-abbreviated axis tick, e.g. "₹12k"; zero stays "0". */
export function formatPaiseAxisTick(paise: number): string {
  if (paise === 0) return "0";
  return `₹${(paise / 100 / 1000).toFixed(0)}k`;
}

/** Format an integer paise value as a full ₹ amount with en-IN grouping and no decimals. */
export function formatPaiseFull(paise: number): string {
  const rupees = paise / 100;
  return `₹${rupees.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/**
 * Shape reports month points into the overlapped-bar chart series: per month,
 * received is a part-of-whole of revenue, so the chart renders revenue as the
 * back bar and received in front of it.
 */
export function shapeChartSeries(months: ReportsMonthPoint[]): ReportsChartDatum[] {
  return months.map((m) => ({
    month: m.month,
    label: formatChartMonthLabel(m.month),
    revenue: m.revenue,
    received: m.received,
  }));
}
