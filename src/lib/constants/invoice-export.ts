import { currentIndianFY } from "@/lib/invoice/export-url";
import type {
  ExportColState,
  ExportDateRangeId,
  ExportFormat,
  ExportStatusId,
} from "@/lib/types/invoice-export";

export const EXPORT_FORMAT_OPTS: ReadonlyArray<{
  id: ExportFormat;
  label: string;
  sub: string;
}> = [
  { id: "csv", label: "CSV", sub: "Open in Excel / Sheets" },
  { id: "pdf", label: "PDF", sub: "Printable summary" },
];

export const EXPORT_DATE_PRESETS: ReadonlyArray<{
  id: ExportDateRangeId;
  label: string;
}> = [
  { id: "this-month", label: "This month" },
  { id: "last-month", label: "Last month" },
  { id: "this-quarter", label: "This quarter" },
  // Label is computed at module load time from the real calendar date (AC5).
  { id: "fy", label: currentIndianFY().label },
  { id: "all", label: "All time" },
  { id: "custom", label: "Custom…" },
];

export const EXPORT_STATUS_CHIPS: ReadonlyArray<{
  id: ExportStatusId;
  label: string;
  dot: string | null;
}> = [
  { id: "all", label: "All", dot: null },
  { id: "paid", label: "Paid", dot: "bg-paid" },
  { id: "sent", label: "Sent", dot: "bg-info" },
  { id: "viewed", label: "Viewed", dot: "bg-info" },
  { id: "overdue", label: "Overdue", dot: "bg-overdue" },
  { id: "draft", label: "Draft", dot: "bg-draft" },
];

export const EXPORT_COL_OPTS: ReadonlyArray<{
  id: keyof ExportColState;
  label: string;
}> = [
  { id: "items", label: "Line items" },
  { id: "tax", label: "Tax breakdown" },
  { id: "notes", label: "Notes & terms" },
];
