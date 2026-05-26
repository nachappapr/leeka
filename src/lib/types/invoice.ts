import type { StatusPillStatus } from "@/components/ui/custom/status-pill"

export interface Invoice {
  id: string
  customer: string
  city: string
  date: string
  amount: string
  status: StatusPillStatus
}

export interface FilterChip {
  label: string
  count: number
  active?: boolean
}
