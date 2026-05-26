export type ActivityIconKey = "paid" | "viewed" | "reminder" | "created"

export interface ActivityItem {
  icon: ActivityIconKey
  title: string
  meta: string
}
