import type { StatusPillStatus } from "@/components/ui/custom/status-pill";

export interface Invoice {
  id: string;
  /** The Postgres UUID of the invoice row. Populated when coming from real DB data; absent for synthetic (new draft) and legacy mock rows. */
  invoiceUuid?: string;
  /** Public share token for the hosted pay page. Populated for real DB rows where a token exists; absent for synthetic/mock rows and null DB values. */
  publicToken?: string;
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
  /** Optional GST percentage label — present in legacy/mock data; real rows use stored taxTotal. */
  taxPct?: number;
  /** Authoritative stored subtotal in paise. */
  subtotal: number;
  /** Authoritative stored tax total in paise. */
  taxTotal: number;
  /** Authoritative stored total in paise. */
  total: number;
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
  cgst: number;
  sgst: number;
  igst: number;
}

export interface SaveDraftResult {
  invoiceId: string;
  status: "draft";
  subtotal: number;
  taxTotal: number;
  total: number;
  cgst: number;
  sgst: number;
  igst: number;
  roundOff: number;
  isInterstate: boolean;
  gstEnabled: boolean;
  lines: SavedDraftLine[];
}

export type SaveDraftOutcome = { ok: true } | { ok: false; error: string };

export type InvoiceSortId = "newest" | "oldest" | "amtHigh" | "amtLow" | "nameAZ";

export interface InvoiceSortOption {
  id: InvoiceSortId;
  label: string;
  hint: string;
  iconKey: "arrowDown" | "arrowUp" | "rupee" | "user";
}

export interface InvoicePageCursor {
  issueDate: string;
  /** ISO-8601 timestamptz string from invoices.created_at — second cursor field after issue_date. */
  createdAt: string;
  id: string;
}

export interface InvoicePage {
  rows: ReadonlyArray<Invoice>;
  nextCursor: InvoicePageCursor | null;
}

export type InvoiceStatusCounts = Partial<Record<InvoiceStatusFilter, number>>;
