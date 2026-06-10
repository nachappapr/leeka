// Types for the Export Invoices modal feature.

export type ExportFormat = "csv" | "pdf";

export type ExportDateRangeId =
  | "this-month"
  | "last-month"
  | "this-quarter"
  | "fy"
  | "all"
  | "custom";

export type ExportStatusId = "all" | "paid" | "sent" | "viewed" | "overdue" | "draft";

export interface ExportColState {
  items: boolean;
  tax: boolean;
  notes: boolean;
}
