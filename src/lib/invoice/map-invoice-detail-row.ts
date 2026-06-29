import type { InvoiceDetailRow } from "@/lib/data/invoice";
import type { InvoiceDetail } from "@/lib/types/invoice";
import type { StatusPillStatus } from "@/components/ui/custom/status-pill";
import type { Database } from "@/lib/types/database";
import { formatPaise } from "@/lib/utils";
import { mapActivityTimeline } from "@/lib/invoice/map-activity-event";
import {
  computeUnpaidDestination,
  computeReversible,
} from "@/lib/invoice/compute-unpaid-destination";

type DbStatus = Database["public"]["Enums"]["invoice_status"];

export type MapInvoiceDetailResult =
  | { kind: "not-found" }
  | { kind: "redirect-edit" }
  | { kind: "ok"; detail: InvoiceDetail };

function dbStatusToStatusPill(status: Exclude<DbStatus, "draft">): StatusPillStatus {
  switch (status) {
    case "sent":
      return "sent";
    case "viewed":
      return "viewed";
    case "partial":
      return "partial";
    case "pending":
      return "pending";
    case "paid":
      return "paid";
    case "overdue":
      return "overdue";
    case "cancelled":
      return "cancelled";
  }
}

export function mapInvoiceDetailRow(row: InvoiceDetailRow | null): MapInvoiceDetailResult {
  if (!row) return { kind: "not-found" };
  if (row.status === "draft") return { kind: "redirect-edit" };

  const todayIst = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
    new Date(),
  );

  const businessRaw = row.businesses;
  const customerRaw = row.customers;
  const items = [...(row.invoice_line_items ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((it) => ({
      name: it.name,
      qty: it.qty,
      unitPrice: it.unit_price,
      gstRate: it.gst_rate,
      discount: it.discount,
      lineSubtotal: it.line_subtotal,
      hsnSac: it.hsn_sac ?? undefined,
    }));

  const displayId = row.number ? `#${row.number}` : `#${row.id.slice(0, 8).toUpperCase()}`;

  const detail: InvoiceDetail = {
    id: displayId,
    invoiceUuid: row.id,
    publicToken: row.public_token ?? undefined,
    customer: customerRaw?.name ?? "",
    city: customerRaw?.city ?? "",
    isoDate: row.issue_date,
    amount: formatPaise(row.total),
    status: dbStatusToStatusPill(row.status),
    items,
    subtotal: row.subtotal,
    taxTotal: row.tax_total,
    total: row.total,
    gstEnabled: row.gst_enabled,
    isInterstate: row.is_interstate,
    cgst: row.cgst,
    sgst: row.sgst,
    igst: row.igst,
    roundOff: row.round_off,
    dueIsoDate: row.due_date ?? row.issue_date,
    issuerName: businessRaw?.name ?? "",
    notes: row.notes ?? undefined,
    activity: mapActivityTimeline(row.invoice_events),
    reversible: computeReversible(row.payments),
    unpaidDestination: computeUnpaidDestination(row.due_date, row.viewed_at, todayIst),
  };

  return { kind: "ok", detail };
}
