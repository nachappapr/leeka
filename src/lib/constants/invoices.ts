import type { Invoice, InvoiceFilterChip } from "@/lib/types"

export const INVOICES: ReadonlyArray<Invoice> = [
  { id: "#INV-1042", customer: "Mehta General Store",  city: "Mumbai",    isoDate: "2026-05-15", amount: "₹24,500", status: "overdue" },
  { id: "#INV-1041", customer: "Priya Boutique",        city: "Delhi",     isoDate: "2026-05-14", amount: "₹12,800", status: "sent"    },
  { id: "#INV-1040", customer: "Sharma Electronics",    city: "Bengaluru", isoDate: "2026-05-12", amount: "₹8,200",  status: "paid"    },
  { id: "#INV-1039", customer: "Kumar Pharmacy",        city: "Pune",      isoDate: "2026-05-10", amount: "₹6,750",  status: "paid"    },
  { id: "#INV-1038", customer: "Delhi Textile House",   city: "Delhi",     isoDate: "2026-05-08", amount: "₹18,900", status: "draft"   },
  { id: "#INV-1037", customer: "Anand Steel Works",     city: "Surat",     isoDate: "2026-05-05", amount: "₹31,200", status: "overdue" },
  { id: "#INV-1036", customer: "Gupta Trading Co.",     city: "Jaipur",    isoDate: "2026-05-02", amount: "₹9,400",  status: "viewed"  },
  { id: "#INV-1035", customer: "Nair Constructions",    city: "Kochi",     isoDate: "2026-04-28", amount: "₹47,600", status: "paid"    },
]

// "partial" and "pending" StatusPillStatus values are intentionally omitted —
// the Bahi invoices design exposes only these 5 status filters.
export const INVOICES_FILTER_CHIPS: ReadonlyArray<InvoiceFilterChip> = [
  { id: "all",     label: "All"     },
  { id: "paid",    label: "Paid"    },
  { id: "sent",    label: "Sent"    },
  { id: "viewed",  label: "Viewed"  },
  { id: "overdue", label: "Overdue" },
  { id: "draft",   label: "Draft"   },
]
