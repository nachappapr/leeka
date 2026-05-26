import type {
  NotificationGroupData,
  NotificationItemData,
} from "@/lib/types/notifications"

const now = Date.now()
const minutesAgo = (m: number) => new Date(now - m * 60_000)
const hoursAgo = (h: number) => new Date(now - h * 60 * 60_000)
const daysAgo = (d: number) => new Date(now - d * 24 * 60 * 60_000)

const TODAY: NotificationItemData[] = [
  { id: "n1", customer: "Priya Sharma", verb: "paid invoice", amount: 24500, invoiceNo: "INV-2451", tone: "paid", timestamp: minutesAgo(8), unread: true },
  { id: "n2", customer: "Anand Mehta", verb: "viewed invoice", amount: 12300, invoiceNo: "INV-2449", tone: "info", timestamp: minutesAgo(34), unread: true },
  { id: "n3", customer: "Ritu Kapoor", verb: "replied on WhatsApp about", amount: 8750, invoiceNo: "INV-2447", tone: "whatsapp", timestamp: hoursAgo(1), unread: true },
  { id: "n4", customer: "Vikram Joshi", verb: "is pending payment for", amount: 1200, invoiceNo: "INV-2445", tone: "pending", timestamp: hoursAgo(3) },
  { id: "n5", customer: "Sneha Reddy", verb: "is overdue on", amount: 45000, invoiceNo: "INV-2438", tone: "overdue", timestamp: hoursAgo(6) },
  { id: "n6", customer: "Karthik Iyer", verb: "paid invoice", amount: 9800, invoiceNo: "INV-2436", tone: "paid", timestamp: hoursAgo(9) },
]

const EARLIER: NotificationItemData[] = [
  { id: "n7", customer: "Meera Nair", verb: "is overdue on", amount: 85000, invoiceNo: "INV-2412", tone: "overdue", timestamp: daysAgo(2) },
  { id: "n8", customer: "Rohan Desai", verb: "paid invoice", amount: 33250, invoiceNo: "INV-2408", tone: "paid", timestamp: daysAgo(2) },
  { id: "n9", customer: "Aishwarya Pillai", verb: "replied on WhatsApp about", amount: 5600, invoiceNo: "INV-2403", tone: "whatsapp", timestamp: daysAgo(3) },
  { id: "n10", customer: "Suresh Babu", verb: "viewed invoice", amount: 18900, invoiceNo: "INV-2398", tone: "info", timestamp: daysAgo(4) },
  { id: "n11", customer: "Divya Krishnan", verb: "is pending payment for", amount: 14750, invoiceNo: "INV-2391", tone: "pending", timestamp: daysAgo(5) },
]

export const NOTIFICATIONS: NotificationGroupData[] = [
  { id: "today", label: "Today", items: TODAY },
  { id: "earlier", label: "Earlier", items: EARLIER },
]
