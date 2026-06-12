import type React from "react";

import { Check, Eye, Plus, WhatsApp } from "@/components/icons";
import type { ActivityFilterId, ActivityIconKey, ActivityItem } from "@/lib/types";
import type { NotificationTone } from "@/lib/types/notifications";

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

export const ACTIVITY_FILTER_LABELS: Record<ActivityFilterId, string> = {
  all: "All",
  payments: "Payments",
  views: "Views",
  reminders: "Reminders",
};

export const ACTIVITY_GROUP_ORDER = ["today", "yesterday", "week", "earlier"] as const;

export const ACTIVITY_GROUP_LABELS: Record<string, string> = {
  today: "Today",
  yesterday: "Yesterday",
  week: "This week",
  earlier: "Earlier",
};

// ── "This month at a glance" sidebar card ────────────────────────────────────

export type GlanceDef = { label: string; tone: NotificationTone; eventType: string };

export const GLANCE_DEFS: ReadonlyArray<GlanceDef> = [
  { label: "Payments received", tone: "paid", eventType: "paid" },
  { label: "Invoice views", tone: "info", eventType: "viewed" },
  { label: "Reminders sent", tone: "whatsapp", eventType: "reminder_sent" },
];
