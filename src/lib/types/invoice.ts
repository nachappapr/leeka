import type { StatusPillStatus } from "@/components/ui/custom/status-pill"

export interface Invoice {
  id: string
  customer: string
  city: string
  isoDate: string
  amount: string
  status: StatusPillStatus
}

export type InvoiceStatusFilter = StatusPillStatus | "all"

export interface InvoiceFilterChip {
  id: InvoiceStatusFilter
  label: string
}

// ── Invoice detail ──────────────────────────────────────────────────────────
// Extends Invoice with line items, tax, due date, and issuer info needed by
// the invoice detail page. Real data comes from the database later; the
// INVOICE_DETAILS constant in src/lib/constants/invoices.ts seeds these for
// the static implementation.

export interface InvoiceLineItem {
  name: string
  qty: number
  unitPrice: number // rupees as integer
}

export interface InvoiceDetail extends Invoice {
  items: ReadonlyArray<InvoiceLineItem>
  taxPct: number
  dueIsoDate: string
  issuerName: string
  notes?: string
}

// ── Invoice list sort/filter types ─────────────────────────────────────────

export type InvoiceSortId =
  | "newest"
  | "oldest"
  | "amtHigh"
  | "amtLow"
  | "nameAZ"

export interface InvoiceSortOption {
  id: InvoiceSortId
  label: string
  hint: string
  iconKey: "arrowDown" | "arrowUp" | "rupee" | "user"
}
