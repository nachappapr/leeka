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

export type NotificationItemData = {
  id: string
  customer: string
  verb: string
  amount: number
  invoiceNo: string
  tone: NotificationTone
  /** ISO string or Date — formatter in notification-item handles both. */
  timestamp: string | Date
  unread?: boolean
  href?: string
}

export type NotificationGroupData = {
  id: string
  label: string
  items: NotificationItemData[]
}
