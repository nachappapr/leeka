import type { FilterChip, Invoice } from "@/lib/types"

export const INVOICES: ReadonlyArray<Invoice> = [
  { id: "#INV-1042", customer: "Mehta General Store",  city: "Mumbai",    date: "15 May 2026", amount: "₹24,500", status: "overdue" },
  { id: "#INV-1041", customer: "Priya Boutique",        city: "Delhi",     date: "14 May 2026", amount: "₹12,800", status: "sent"    },
  { id: "#INV-1040", customer: "Sharma Electronics",    city: "Bengaluru", date: "12 May 2026", amount: "₹8,200",  status: "paid"    },
  { id: "#INV-1039", customer: "Kumar Pharmacy",        city: "Pune",      date: "10 May 2026", amount: "₹6,750",  status: "paid"    },
  { id: "#INV-1038", customer: "Delhi Textile House",   city: "Delhi",     date: "8 May 2026",  amount: "₹18,900", status: "draft"   },
  { id: "#INV-1037", customer: "Anand Steel Works",     city: "Surat",     date: "5 May 2026",  amount: "₹31,200", status: "overdue" },
]

export const FILTER_CHIPS: ReadonlyArray<FilterChip> = [
  { label: "All",     count: 18, active: true },
  { label: "Paid",    count: 7  },
  { label: "Sent",    count: 5  },
  { label: "Overdue", count: 3  },
  { label: "Draft",   count: 3  },
]
