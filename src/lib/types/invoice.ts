import type { StatusPillStatus } from "@/components/ui/custom/status-pill";

export interface Invoice {
  id: string;
  customer: string;
  city: string;
  isoDate: string;
  amount: string;
  status: StatusPillStatus;
}

export type InvoiceStatusFilter = StatusPillStatus | "all";

export interface InvoiceFilterChip {
  id: InvoiceStatusFilter;
  label: string;
}

export interface InvoiceLineItem {
  name: string;
  qty: number;
  unitPrice: number; // rupees as integer
}

export interface InvoiceDetail extends Invoice {
  items: ReadonlyArray<InvoiceLineItem>;
  taxPct: number;
  dueIsoDate: string;
  issuerName: string;
  notes?: string;
}

/**
 * Shape returned by saveInvoiceDraft on success — enough for the Unit 2
 * preview panel without a separate fetch.
 *
 * All money values are integer paise.
 */
export interface SavedDraftLine {
  position: number;
  name: string;
  hsn_sac: string | null;
  qty: number;
  unit_price: number;
  discount: number;
  gst_rate: number;
  line_subtotal: number;
  line_tax: number;
  line_total: number;
}

export interface SaveDraftResult {
  invoiceId: string;
  status: "draft";
  subtotal: number;
  taxTotal: number;
  total: number;
  lines: SavedDraftLine[];
}

export type InvoiceSortId = "newest" | "oldest" | "amtHigh" | "amtLow" | "nameAZ";

export interface InvoiceSortOption {
  id: InvoiceSortId;
  label: string;
  hint: string;
  iconKey: "arrowDown" | "arrowUp" | "rupee" | "user";
}
