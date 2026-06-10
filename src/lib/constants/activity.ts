import type React from "react";

import { Check, Eye, Plus, WhatsApp } from "@/components/icons";
import type {
  ActivityFilterId,
  ActivityGlanceRow,
  ActivityIconKey,
  ActivityItem,
} from "@/lib/types";
import type { NotificationTone } from "@/lib/types/notifications";
import { ACTIVITY_NOTIFICATIONS } from "@/lib/constants/notifications";

export const ACTIVITY_ITEMS: ReadonlyArray<ActivityItem> = [
  { icon: "paid", title: "Sharma Sweets paid ₹4,725", meta: "2 min ago" },
  { icon: "viewed", title: "Rohit Kumar viewed INV-023", meta: "1 hr ago" },
  { icon: "reminder", title: "Sent reminder to Anita Tailoring", meta: "3 hrs ago" },
  { icon: "created", title: "Created INV-024", meta: "Today, 11:21 AM" },
];

export const ACTIVITY_ICON_STYLE: Record<ActivityIconKey, string> = {
  paid: "bg-paid-soft text-paid",
  viewed: "bg-info-soft text-info",
  reminder: "bg-whatsapp-soft text-whatsapp-icon",
  created: "bg-coral-soft text-coral-press",
};

export const ACTIVITY_ICON_MAP: Record<
  ActivityIconKey,
  React.ComponentType<{ className?: string }>
> = {
  paid: Check,
  viewed: Eye,
  reminder: WhatsApp,
  created: Plus,
};

// ── Activity feed filter chips ────────────────────────────────────────────────

export const ACTIVITY_FILTER_TONES: Record<ActivityFilterId, NotificationTone[]> = {
  all: [],
  payments: ["paid"],
  views: ["info"],
  overdue: ["overdue"],
  whatsapp: ["whatsapp", "sent"],
  customers: ["customer"],
};

export const ACTIVITY_FILTER_LABELS: Record<ActivityFilterId, string> = {
  all: "All",
  payments: "Payments",
  views: "Views",
  overdue: "Overdue",
  whatsapp: "WhatsApp",
  customers: "Customers",
};

export const ACTIVITY_GROUP_ORDER = ["today", "yesterday", "week", "earlier"] as const;

export const ACTIVITY_GROUP_LABELS: Record<string, string> = {
  today: "Today",
  yesterday: "Yesterday",
  week: "This week",
  earlier: "Earlier",
};

// ── "This month at a glance" sidebar card ────────────────────────────────────

type GlanceDef = { label: string; tone: NotificationTone; tones: NotificationTone[] };

const GLANCE_DEFS: GlanceDef[] = [
  { label: "Payments received", tone: "paid", tones: ["paid"] },
  { label: "Invoice views", tone: "info", tones: ["info"] },
  { label: "Overdue alerts", tone: "overdue", tones: ["overdue"] },
  { label: "WhatsApp delivery", tone: "whatsapp", tones: ["whatsapp", "sent"] },
  { label: "New customers", tone: "customer", tones: ["customer"] },
];

export const ACTIVITY_GLANCE_ROWS: ReadonlyArray<ActivityGlanceRow> = GLANCE_DEFS.map((r) => ({
  label: r.label,
  tone: r.tone,
  count: ACTIVITY_NOTIFICATIONS.filter((n) => r.tones.includes(n.tone)).length,
}));

export const ACTIVITY_UNREAD_COUNT = ACTIVITY_NOTIFICATIONS.filter((n) => n.unread).length;
