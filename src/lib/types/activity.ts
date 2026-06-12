export type ActivityIconKey = "paid" | "viewed" | "reminder" | "created";

export interface ActivityItem {
  icon: ActivityIconKey;
  title: string;
  meta: string;
}

export type ActivityFilterId = "all" | "payments" | "views" | "reminders";

export interface ActivityGlanceRow {
  label: string;
  tone: import("@/lib/types/notifications").NotificationTone;
  count: number;
}
