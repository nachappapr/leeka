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
