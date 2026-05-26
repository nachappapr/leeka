import type {
  NotificationGroupData,
  NotificationItemData,
} from "@/lib/types/notifications"

const now = Date.now()
const minutesAgo = (m: number) => new Date(now - m * 60_000)
const hoursAgo = (h: number) => new Date(now - h * 60 * 60_000)
const daysAgo = (d: number) => new Date(now - d * 24 * 60 * 60_000)

// ── Panel data (today + earlier, shown in the notification dropdown) ──────────

const PANEL_TODAY: NotificationItemData[] = [
  { id: "n1", customer: "Priya Sharma", verb: "paid invoice", amount: 24500, invoiceNo: "INV-2451", tone: "paid", timestamp: minutesAgo(8), unread: true },
  { id: "n2", customer: "Anand Mehta", verb: "viewed invoice", amount: 12300, invoiceNo: "INV-2449", tone: "info", timestamp: minutesAgo(34), unread: true },
  { id: "n3", customer: "Ritu Kapoor", verb: "replied on WhatsApp about", amount: 8750, invoiceNo: "INV-2447", tone: "whatsapp", timestamp: hoursAgo(1), unread: true },
  { id: "n4", customer: "Vikram Joshi", verb: "is pending payment for", amount: 1200, invoiceNo: "INV-2445", tone: "pending", timestamp: hoursAgo(3) },
  { id: "n5", customer: "Sneha Reddy", verb: "is overdue on", amount: 45000, invoiceNo: "INV-2438", tone: "overdue", timestamp: hoursAgo(6) },
  { id: "n6", customer: "Karthik Iyer", verb: "paid invoice", amount: 9800, invoiceNo: "INV-2436", tone: "paid", timestamp: hoursAgo(9) },
]

const PANEL_EARLIER: NotificationItemData[] = [
  { id: "n7", customer: "Meera Nair", verb: "is overdue on", amount: 85000, invoiceNo: "INV-2412", tone: "overdue", timestamp: daysAgo(2) },
  { id: "n8", customer: "Rohan Desai", verb: "paid invoice", amount: 33250, invoiceNo: "INV-2408", tone: "paid", timestamp: daysAgo(2) },
  { id: "n9", customer: "Aishwarya Pillai", verb: "replied on WhatsApp about", amount: 5600, invoiceNo: "INV-2403", tone: "whatsapp", timestamp: daysAgo(3) },
  { id: "n10", customer: "Suresh Babu", verb: "viewed invoice", amount: 18900, invoiceNo: "INV-2398", tone: "info", timestamp: daysAgo(4) },
  { id: "n11", customer: "Divya Krishnan", verb: "is pending payment for", amount: 14750, invoiceNo: "INV-2391", tone: "pending", timestamp: daysAgo(5) },
]

export const NOTIFICATIONS: NotificationGroupData[] = [
  { id: "today", label: "Today", items: PANEL_TODAY },
  { id: "earlier", label: "Earlier", items: PANEL_EARLIER },
]

// ── Activity page data (flat list, all 4 chronological groups) ────────────────

export const ACTIVITY_NOTIFICATIONS: NotificationItemData[] = [
  // Today
  { id: "a1",  tone: "paid",     customer: "Sharma Sweets",  verb: "paid invoice",                        amount: 4725,  invoiceNo: "INV-1024", timestamp: minutesAgo(2),   unread: true,  group: "today"     },
  { id: "a2",  tone: "info",     customer: "Anil Kumar",     verb: "opened your invoice",                               invoiceNo: "INV-1023", timestamp: minutesAgo(18),  unread: true,  group: "today"     },
  { id: "a3",  tone: "overdue",  customer: "Patel Traders",  verb: "is 3 days overdue on",               amount: 12400, invoiceNo: "INV-1019", timestamp: hoursAgo(1),     unread: true,  group: "today"     },
  { id: "a4",  tone: "whatsapp", customer: "Priya Patel",    verb: "received your invoice on WhatsApp",                 invoiceNo: "INV-1022", timestamp: hoursAgo(3),                    group: "today"     },
  // Yesterday
  { id: "a5",  tone: "customer", customer: "Meera Iyer",     verb: "was added as a customer",                                                  timestamp: daysAgo(1),                     group: "yesterday" },
  { id: "a6",  tone: "paid",     customer: "Gupta Stores",   verb: "marked paid manually",               amount: 8200,  invoiceNo: "INV-1008", timestamp: daysAgo(1),                     group: "yesterday" },
  { id: "a7",  tone: "sent",     customer: "Singh Foods",    verb: "invoice was sent",                   amount: 6100,  invoiceNo: "INV-1018", timestamp: daysAgo(1),                     group: "yesterday" },
  // This week
  { id: "a8",  tone: "info",     customer: "Vikram Mehta",   verb: "opened your invoice",                               invoiceNo: "INV-1015", timestamp: daysAgo(3),                     group: "week"      },
  { id: "a9",  tone: "whatsapp", customer: "Sharma Sweets",  verb: "received your invoice on WhatsApp",                 invoiceNo: "INV-1014", timestamp: daysAgo(3),                     group: "week"      },
  { id: "a10", tone: "overdue",  customer: "Ravi Plastics",  verb: "reminder sent — 7 days overdue on", amount: 9800,  invoiceNo: "INV-1009", timestamp: daysAgo(4),                     group: "week"      },
  { id: "a11", tone: "paid",     customer: "Joshi Hardware", verb: "paid via UPI",                       amount: 3200,  invoiceNo: "INV-1012", timestamp: daysAgo(5),                     group: "week"      },
  // Earlier
  { id: "a12", tone: "customer", customer: "Anita Reddy",    verb: "was added as a customer",                                                  timestamp: daysAgo(12),                    group: "earlier"   },
  { id: "a13", tone: "draft",    customer: "You",            verb: "saved a draft",                                     invoiceNo: "INV-1005", timestamp: daysAgo(14),                    group: "earlier"   },
  { id: "a14", tone: "paid",     customer: "Krishna Stores", verb: "paid invoice",                       amount: 14500, invoiceNo: "INV-1003", timestamp: daysAgo(16),                    group: "earlier"   },
]
