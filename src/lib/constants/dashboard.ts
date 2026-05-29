import type { DashSortOption } from "@/lib/types/dashboard"
import type { StatusPillStatus } from "@/components/ui/custom/status-pill"

export const DASH_SORTS: ReadonlyArray<DashSortOption> = [
  { id: "newest",  label: "Newest first",          hint: "Most recent on top",    iconKey: "arrowDown" },
  { id: "oldest",  label: "Oldest first",           hint: "Earliest on top",       iconKey: "arrowUp"   },
  { id: "amtHigh", label: "Amount · high to low",   hint: "Biggest bills first",   iconKey: "rupee"     },
  { id: "amtLow",  label: "Amount · low to high",   hint: "Smallest bills first",  iconKey: "rupee"     },
  { id: "nameAZ",  label: "Customer name · A–Z",    hint: "Alphabetical",          iconKey: "user"      },
] as const

export interface DashStatusOption {
  id: StatusPillStatus
  label: string
}

export const DASH_STATUSES: ReadonlyArray<DashStatusOption> = [
  { id: "overdue", label: "Overdue" },
  { id: "sent",    label: "Sent"    },
  { id: "viewed",  label: "Viewed"  },
  { id: "paid",    label: "Paid"    },
  { id: "draft",   label: "Draft"   },
] as const

/** Shared status-dot color map — single source of truth for mobile filter UI. Fix B + #10. */
export const STATUS_DOT_CLASS: Record<string, string> = {
  overdue: "bg-overdue",
  sent:    "bg-info",
  viewed:  "bg-info",
  paid:    "bg-paid",
  draft:   "bg-draft",
  partial: "bg-pending-bar",
  pending: "bg-pending-bar",
}
