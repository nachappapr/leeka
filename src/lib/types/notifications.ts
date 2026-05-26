/**
 * Notification domain types — single source of truth.
 * UI components and seed data both import from here.
 */

export type NotificationTone =
  | "paid"
  | "pending"
  | "overdue"
  | "info"
  | "whatsapp"
  | "customer"
  | "draft"
  | "sent"

export type NotificationGroup = "today" | "yesterday" | "week" | "earlier"

export type NotificationItemData = {
  id: string
  customer: string
  verb: string
  amount?: number
  invoiceNo?: string
  tone: NotificationTone
  /** ISO string or Date — formatter in notification-item handles both. */
  timestamp: string | Date
  unread?: boolean
  href?: string
  /** Used by the activity page to group items chronologically. */
  group?: NotificationGroup
}

export type NotificationGroupData = {
  id: string
  label: string
  items: NotificationItemData[]
}
