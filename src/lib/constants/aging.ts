import type { AgingBucket } from "@/lib/types"

export const AGING_BUCKETS: ReadonlyArray<AgingBucket> = [
  { label: "0–7 days",   amount: "₹12,500", percent: 47, tone: "paid"    },
  { label: "8–14 days",  amount: "₹8,300",  percent: 31, tone: "pending" },
  { label: "15–30 days", amount: "₹3,000",  percent: 11, tone: "pending" },
  { label: "30+ days",   amount: "₹2,600",  percent: 10, tone: "overdue" },
]
