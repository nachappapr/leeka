export interface ReportsMonthPoint {
  month: string;
  revenue: number;
  received: number;
}

export interface ReportsSummary {
  revenue: number;
  received: number;
  invoice_count: number;
  avg_invoice_value: number;
  avg_days_to_pay: number | null;
}

export interface ReportsMetrics {
  months: ReportsMonthPoint[];
  summary: ReportsSummary;
}

export type RangeId = "3M" | "6M" | "12M" | "FY";
