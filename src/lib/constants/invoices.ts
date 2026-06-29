import type { Invoice, InvoiceDetail, InvoiceFilterChip, InvoiceSortOption } from "@/lib/types";
import type { StatusPillStatus } from "@/components/ui/custom/status-pill";

export const INVOICES: ReadonlyArray<Invoice> = [
  {
    id: "#INV-1042",
    customer: "Mehta General Store",
    city: "Mumbai",
    isoDate: "2026-05-15",
    amount: "₹24,500",
    status: "overdue",
  },
  {
    id: "#INV-1041",
    customer: "Priya Boutique",
    city: "Delhi",
    isoDate: "2026-05-14",
    amount: "₹12,800",
    status: "sent",
  },
  {
    id: "#INV-1040",
    customer: "Sharma Electronics",
    city: "Bengaluru",
    isoDate: "2026-05-12",
    amount: "₹8,200",
    status: "paid",
  },
  {
    id: "#INV-1039",
    customer: "Kumar Pharmacy",
    city: "Pune",
    isoDate: "2026-05-10",
    amount: "₹6,750",
    status: "paid",
  },
  {
    id: "#INV-1038",
    customer: "Delhi Textile House",
    city: "Delhi",
    isoDate: "2026-05-08",
    amount: "₹18,900",
    status: "draft",
  },
  {
    id: "#INV-1037",
    customer: "Anand Steel Works",
    city: "Surat",
    isoDate: "2026-05-05",
    amount: "₹31,200",
    status: "overdue",
  },
  {
    id: "#INV-1036",
    customer: "Gupta Trading Co.",
    city: "Jaipur",
    isoDate: "2026-05-02",
    amount: "₹9,400",
    status: "viewed",
  },
  {
    id: "#INV-1035",
    customer: "Nair Constructions",
    city: "Kochi",
    isoDate: "2026-04-28",
    amount: "₹47,600",
    status: "paid",
  },
];

// "partial" and "pending" are intentionally omitted — the design exposes only these 5 status filters.
// "cancelled" is also excluded by app-wide convention (the RPCs filter it out).
export const INVOICES_FILTER_CHIPS: ReadonlyArray<InvoiceFilterChip> = [
  { id: "all", label: "All" },
  { id: "paid", label: "Paid" },
  { id: "sent", label: "Sent" },
  { id: "viewed", label: "Viewed" },
  { id: "overdue", label: "Overdue" },
  { id: "draft", label: "Draft" },
];

const ISSUER = "Raj Kumar";

export const INVOICE_DETAILS: ReadonlyArray<InvoiceDetail> = [
  {
    ...INVOICES[0],
    items: [
      {
        name: "Premium Mithai Box · 500g",
        qty: 4,
        unitPrice: 85000,
        gstRate: 5,
        discount: 0,
        lineSubtotal: 340000,
      },
      {
        name: "Kaju Katli · 250g",
        qty: 2,
        unitPrice: 55000,
        gstRate: 5,
        discount: 0,
        lineSubtotal: 110000,
      },
    ],
    subtotal: 450000,
    taxTotal: 22500,
    total: 472500,
    gstEnabled: true,
    isInterstate: false,
    cgst: 11250,
    sgst: 11250,
    igst: 0,
    roundOff: 0,
    dueIsoDate: "2026-06-15",
    issuerName: ISSUER,
    activity: [],
  },
  {
    ...INVOICES[1],
    items: [
      {
        name: "Cotton Saree · Block Print",
        qty: 3,
        unitPrice: 180000,
        gstRate: 5,
        discount: 0,
        lineSubtotal: 540000,
      },
      {
        name: "Silk Dupatta",
        qty: 4,
        unitPrice: 95000,
        gstRate: 5,
        discount: 0,
        lineSubtotal: 380000,
      },
    ],
    subtotal: 920000,
    taxTotal: 46000,
    total: 966000,
    gstEnabled: true,
    isInterstate: false,
    cgst: 23000,
    sgst: 23000,
    igst: 0,
    roundOff: 0,
    dueIsoDate: "2026-06-13",
    issuerName: ISSUER,
    activity: [],
  },
  {
    ...INVOICES[2],
    items: [
      {
        name: "USB-C Cable · 1m",
        qty: 6,
        unitPrice: 35000,
        gstRate: 5,
        discount: 0,
        lineSubtotal: 210000,
      },
      {
        name: "Wall Charger 20W",
        qty: 2,
        unitPrice: 120000,
        gstRate: 5,
        discount: 0,
        lineSubtotal: 240000,
      },
    ],
    subtotal: 450000,
    taxTotal: 22500,
    total: 472500,
    gstEnabled: true,
    isInterstate: false,
    cgst: 11250,
    sgst: 11250,
    igst: 0,
    roundOff: 0,
    dueIsoDate: "2026-06-11",
    issuerName: ISSUER,
    activity: [],
  },
  {
    ...INVOICES[3],
    items: [
      {
        name: "Multivitamin Tablets · 60ct",
        qty: 5,
        unitPrice: 45000,
        gstRate: 5,
        discount: 0,
        lineSubtotal: 225000,
      },
      {
        name: "Cough Syrup · 100ml",
        qty: 3,
        unitPrice: 18000,
        gstRate: 5,
        discount: 0,
        lineSubtotal: 54000,
      },
    ],
    subtotal: 279000,
    taxTotal: 13950,
    total: 292950,
    gstEnabled: true,
    isInterstate: false,
    cgst: 6975,
    sgst: 6975,
    igst: 0,
    roundOff: 0,
    dueIsoDate: "2026-06-09",
    issuerName: ISSUER,
    activity: [],
  },
  {
    ...INVOICES[4],
    items: [
      {
        name: "Cotton Bedsheet · King",
        qty: 4,
        unitPrice: 160000,
        gstRate: 5,
        discount: 0,
        lineSubtotal: 640000,
      },
      {
        name: "Pillow Covers · Pair",
        qty: 6,
        unitPrice: 40000,
        gstRate: 5,
        discount: 0,
        lineSubtotal: 240000,
      },
    ],
    subtotal: 880000,
    taxTotal: 44000,
    total: 924000,
    gstEnabled: true,
    isInterstate: false,
    cgst: 22000,
    sgst: 22000,
    igst: 0,
    roundOff: 0,
    dueIsoDate: "2026-06-07",
    issuerName: ISSUER,
    activity: [],
  },
  {
    ...INVOICES[5],
    items: [
      {
        name: "MS Steel Rods · 12mm",
        qty: 10,
        unitPrice: 220000,
        gstRate: 5,
        discount: 0,
        lineSubtotal: 2200000,
      },
      {
        name: "TMT Bars · Bundle",
        qty: 2,
        unitPrice: 410000,
        gstRate: 5,
        discount: 0,
        lineSubtotal: 820000,
      },
    ],
    subtotal: 3020000,
    taxTotal: 151000,
    total: 3171000,
    gstEnabled: true,
    isInterstate: false,
    cgst: 75500,
    sgst: 75500,
    igst: 0,
    roundOff: 0,
    dueIsoDate: "2026-06-04",
    issuerName: ISSUER,
    activity: [],
  },
  {
    ...INVOICES[6],
    items: [
      {
        name: "Wholesale Spice Mix · 1kg",
        qty: 5,
        unitPrice: 120000,
        gstRate: 5,
        discount: 0,
        lineSubtotal: 600000,
      },
      {
        name: "Premium Ghee · 500g",
        qty: 4,
        unitPrice: 65000,
        gstRate: 5,
        discount: 0,
        lineSubtotal: 260000,
      },
    ],
    subtotal: 860000,
    taxTotal: 43000,
    total: 903000,
    gstEnabled: true,
    isInterstate: false,
    cgst: 21500,
    sgst: 21500,
    igst: 0,
    roundOff: 0,
    dueIsoDate: "2026-06-01",
    issuerName: ISSUER,
    activity: [],
  },
  {
    ...INVOICES[7],
    items: [
      {
        name: "Cement Bag · 50kg",
        qty: 30,
        unitPrice: 38000,
        gstRate: 5,
        discount: 0,
        lineSubtotal: 1140000,
      },
      {
        name: "Construction Sand · m³",
        qty: 6,
        unitPrice: 250000,
        gstRate: 5,
        discount: 0,
        lineSubtotal: 1500000,
      },
    ],
    subtotal: 2640000,
    taxTotal: 132000,
    total: 2772000,
    gstEnabled: true,
    isInterstate: false,
    cgst: 66000,
    sgst: 66000,
    igst: 0,
    roundOff: 0,
    dueIsoDate: "2026-05-28",
    issuerName: ISSUER,
    activity: [],
  },
];

export const INVOICE_STATUS_LABEL: Record<StatusPillStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  partial: "Partial",
  pending: "Pending",
  overdue: "Overdue",
  paid: "Paid",
  cancelled: "Cancelled",
};

export function findInvoiceDetail(idWithoutHash: string): InvoiceDetail | undefined {
  return INVOICE_DETAILS.find((inv) => inv.id.replace("#", "") === idWithoutHash);
}

/** Standard Indian GST slab rates (percentage values). */
export const GST_RATES = [0, 5, 12, 18, 28] as const;

export type GstRate = (typeof GST_RATES)[number];

export interface GstRateOption {
  value: GstRate;
  label: string;
}

export const GST_RATE_OPTIONS: ReadonlyArray<GstRateOption> = GST_RATES.map((r) => ({
  value: r,
  label: r === 0 ? "0% (Exempt)" : `${r}%`,
}));

export const INVOICE_SORTS: ReadonlyArray<InvoiceSortOption> = [
  { id: "newest", label: "Newest first", hint: "Most recent on top", iconKey: "arrowDown" },
  { id: "oldest", label: "Oldest first", hint: "Earliest on top", iconKey: "arrowUp" },
  { id: "amtHigh", label: "Amount · high to low", hint: "Biggest bills first", iconKey: "rupee" },
  { id: "amtLow", label: "Amount · low to high", hint: "Smallest bills first", iconKey: "rupee" },
  { id: "nameAZ", label: "Customer name · A–Z", hint: "Alphabetical", iconKey: "user" },
] as const;

export interface InvoiceStatusOption {
  id: StatusPillStatus;
  label: string;
}

export const INVOICE_STATUS_OPTIONS: ReadonlyArray<InvoiceStatusOption> = [
  { id: "overdue", label: "Overdue" },
  { id: "sent", label: "Sent" },
  { id: "viewed", label: "Viewed" },
  { id: "paid", label: "Paid" },
  { id: "draft", label: "Draft" },
] as const;

/** Shared status-dot color map — single source of truth for mobile filter UI. */
export const STATUS_DOT_CLASS: Record<string, string> = {
  overdue: "bg-overdue",
  sent: "bg-info",
  viewed: "bg-info",
  paid: "bg-paid",
  draft: "bg-draft",
  partial: "bg-pending-bar",
  pending: "bg-pending-bar",
};
