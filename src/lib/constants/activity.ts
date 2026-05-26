import type React from "react"

import { Check, Eye, Plus, WhatsApp } from "@/components/icons"
import type { ActivityIconKey, ActivityItem } from "@/lib/types"

export const ACTIVITY_ITEMS: ReadonlyArray<ActivityItem> = [
  { icon: "paid",     title: "Sharma Sweets paid ₹4,725",       meta: "2 min ago"        },
  { icon: "viewed",   title: "Rohit Kumar viewed INV-023",       meta: "1 hr ago"         },
  { icon: "reminder", title: "Sent reminder to Anita Tailoring", meta: "3 hrs ago"        },
  { icon: "created",  title: "Created INV-024",                  meta: "Today, 11:21 AM"  },
]

export const ACTIVITY_ICON_STYLE: Record<ActivityIconKey, string> = {
  paid:     "bg-paid-soft text-paid",
  viewed:   "bg-info-soft text-info",
  reminder: "bg-whatsapp-soft text-whatsapp-icon",
  created:  "bg-coral-soft text-coral-press",
}

export const ACTIVITY_ICON_MAP: Record<
  ActivityIconKey,
  React.ComponentType<{ className?: string }>
> = {
  paid:     Check,
  viewed:   Eye,
  reminder: WhatsApp,
  created:  Plus,
}
