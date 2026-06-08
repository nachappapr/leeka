import type { Customer } from "@/lib/types"
import type { Invoice } from "@/lib/types"
import { INVOICES } from "@/lib/constants/invoices"

export const CUSTOMERS: ReadonlyArray<Customer> = [
  // Renamed to match invoice customer names so detail pages show populated tables
  {
    id: "C001",
    name: "Sharma Electronics",
    city: "Bengaluru",
    phone: "+91 98XXX 12345",
    invoiceCount: 4,
    totalBilled: "₹18,200",
    outstanding: "₹4,725",
    email: "orders@sharmaelectronics.in",
    gstin: "29AAJCS1234A1Z5",
    address: "Shop 14, Main Bazaar, Gurugram, Haryana 122001",
    customerSince: "Apr 2024",
    paid: "₹13,475",
  },
  {
    id: "C002",
    name: "Kumar Pharmacy",
    city: "Pune",
    phone: "+91 98XXX 22113",
    invoiceCount: 2,
    totalBilled: "₹3,400",
    outstanding: null,
    email: "kumar.pharmacy@gmail.com",
    // gstin intentionally omitted — shows "Not added" empty state
    address: "42, MG Road, Pune, Maharashtra 411001",
    customerSince: "Jan 2025",
    paid: "₹3,400",
  },
  {
    id: "C003",
    name: "Krishna General",
    city: "Mumbai",
    phone: "+91 99XXX 56789",
    invoiceCount: 8,
    totalBilled: "₹52,300",
    outstanding: null,
    // email intentionally omitted — shows "Not added" empty state
    gstin: "27AABCK5678B2Z3",
    address: "Plot 9, MIDC, Andheri East, Mumbai 400093",
    customerSince: "Feb 2023",
    paid: "₹52,300",
  },
  {
    id: "C004",
    name: "Anita Tailoring",
    city: "Delhi",
    phone: "+91 95XXX 88891",
    invoiceCount: 3,
    totalBilled: "₹7,200",
    outstanding: "₹2,400",
    email: "anita.tailoring@gmail.com",
    gstin: "07AAACA3456C1Z7",
    // address intentionally omitted — shows "Not added" empty state
    customerSince: "Nov 2024",
    paid: "₹4,800",
  },
  {
    id: "C005",
    name: "Modern Bakers",
    city: "Jaipur",
    phone: "+91 90XXX 12233",
    invoiceCount: 5,
    totalBilled: "₹22,100",
    outstanding: "₹6,300",
    email: "contact@modernbakers.co.in",
    gstin: "08AABCM7890D3Z1",
    address: "27B, Pink City Market, Jaipur, Rajasthan 302001",
    customerSince: "Mar 2024",
    paid: "₹15,800",
  },
  {
    id: "C006",
    name: "M. Iqbal & Sons",
    city: "Surat",
    phone: "+91 99XXX 44556",
    invoiceCount: 2,
    totalBilled: "₹1,700",
    outstanding: null,
    email: "iqbal.sons@yahoo.in",
    gstin: "24AADCI4567E2Z8",
    address: "Textile Market, Ring Road, Surat, Gujarat 395002",
    customerSince: "Aug 2024",
    paid: "₹1,700",
  },
]

// ── Lookup helpers ──────────────────────────────────────────────────────────

/** Find a customer by id. Returns undefined if not found. */
export function findCustomer(id: string): Customer | undefined {
  return CUSTOMERS.find((c) => c.id === id)
}

/**
 * Returns all invoices whose `customer` field matches the given name exactly.
 * Used by the customer detail page to build the related-invoices table.
 */
export function customerInvoices(name: string): Invoice[] {
  return INVOICES.filter((inv) => inv.customer === name)
}

/**
 * Computes summary figures for a customer from their matched invoices.
 * Returns pre-formatted ₹-strings consistent with the rest of the data layer.
 */
export function customerInvoiceSummary(name: string): {
  invoices: Invoice[]
  totalBilled: string
  outstanding: string | null
} {
  const invoices = customerInvoices(name)

  if (invoices.length === 0) {
    return { invoices: [], totalBilled: "₹0", outstanding: null }
  }

  const parseAmount = (s: string) =>
    parseInt(s.replace(/[₹,]/g, ""), 10) || 0

  const total = invoices.reduce((sum, inv) => sum + parseAmount(inv.amount), 0)

  const outstandingTotal = invoices
    .filter((inv) => inv.status === "overdue" || inv.status === "sent" || inv.status === "viewed")
    .reduce((sum, inv) => sum + parseAmount(inv.amount), 0)

  return {
    invoices,
    totalBilled: `₹${total.toLocaleString("en-IN")}`,
    outstanding: outstandingTotal > 0
      ? `₹${outstandingTotal.toLocaleString("en-IN")}`
      : null,
  }
}
