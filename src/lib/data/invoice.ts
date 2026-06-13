import "server-only";

import { createClient } from "@/lib/supabase/server";
import logger from "@/lib/logger";
import { formatPaise } from "@/lib/utils";
import type { Database } from "@/lib/types/database";
import type { Invoice } from "@/lib/types/invoice";
import type {
  InvoicePage,
  InvoicePageCursor,
  InvoiceStatusCounts,
  InvoiceStatusFilter,
} from "@/lib/types/invoice";

export interface DraftInvoiceData {
  invoiceId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerStateCode: string | null;
  notes: string | null;
  isoDate: string;
  dueIsoDate: string | null;
  items: Array<{
    name: string;
    hsn_sac: string | null;
    qty: number;
    unit_price: number;
    discount: number;
    gst_rate: number;
  }>;
  subtotal: number;
  taxTotal: number;
  total: number;
  gstEnabled: boolean;
  isInterstate: boolean;
  cgst: number;
  sgst: number;
  igst: number;
  roundOff: number;
}

/**
 * Loads a draft invoice by id for the edit form round-trip.
 *
 * Returns null when the invoice does not exist, is not a draft, or the caller
 * is not a member of the owning business (RLS enforces the latter silently —
 * the row simply won't be returned).
 *
 * Server-only: never import this in a Client Component.
 */
export async function getDraftInvoice(invoiceId: string): Promise<DraftInvoiceData | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invoices")
    .select(
      `
      id,
      status,
      issue_date,
      due_date,
      notes,
      subtotal,
      tax_total,
      total,
      gst_enabled,
      is_interstate,
      cgst,
      sgst,
      igst,
      round_off,
      customer_id,
      customers ( id, name, phone, state_code ),
      invoice_line_items (
        position,
        name,
        hsn_sac,
        qty,
        unit_price,
        discount,
        gst_rate
      )
    `,
    )
    .eq("id", invoiceId)
    .eq("status", "draft")
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      logger.error({ err: { code: error.code } }, "getDraftInvoice: query failed");
    }
    return null;
  }

  if (!data || !data.customer_id) return null;

  const customer = Array.isArray(data.customers) ? data.customers[0] : data.customers;
  if (!customer) return null;

  const lineItems = (data.invoice_line_items ?? []).sort((a, b) => a.position - b.position);

  return {
    invoiceId: data.id,
    customerId: data.customer_id,
    customerName: customer.name,
    customerPhone: customer.phone ?? "",
    customerStateCode: customer.state_code ?? null,
    notes: data.notes,
    isoDate: data.issue_date,
    dueIsoDate: data.due_date,
    items: lineItems.map((it) => ({
      name: it.name,
      hsn_sac: it.hsn_sac,
      qty: it.qty,
      unit_price: it.unit_price,
      discount: it.discount,
      gst_rate: it.gst_rate,
    })),
    subtotal: data.subtotal,
    taxTotal: data.tax_total,
    total: data.total,
    gstEnabled: data.gst_enabled ?? false,
    isInterstate: data.is_interstate ?? false,
    cgst: data.cgst ?? 0,
    sgst: data.sgst ?? 0,
    igst: data.igst ?? 0,
    roundOff: data.round_off ?? 0,
  };
}

type DbStatus = Database["public"]["Enums"]["invoice_status"];

export async function resolveBusinessId(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: member } = await supabase
    .from("business_members")
    .select("business_id")
    .eq("user_id", user.id)
    .single();

  return member?.business_id ?? null;
}

interface ListInvoicesPageArgs {
  businessId: string;
  status: InvoiceStatusFilter | null;
  cursor: InvoicePageCursor | null;
  limit?: number;
}

function mapRpcRowToInvoice(row: {
  id: string;
  number: string;
  customer_name: string | null;
  customer_city: string | null;
  issue_date: string;
  total: number;
  status: DbStatus;
}): Invoice {
  const validStatuses = new Set<string>([
    "draft",
    "sent",
    "viewed",
    "partial",
    "pending",
    "paid",
    "overdue",
  ]);
  return {
    id: `#${row.number}`,
    invoiceUuid: row.id,
    customer: row.customer_name ?? "",
    city: row.customer_city ?? "",
    isoDate: row.issue_date,
    amount: formatPaise(row.total),
    status: validStatuses.has(row.status) ? (row.status as Invoice["status"]) : "draft",
  };
}

export async function listInvoicesPage({
  businessId,
  status,
  cursor,
  limit = 25,
}: ListInvoicesPageArgs): Promise<InvoicePage> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("list_invoices_page", {
    p_business_id: businessId,
    p_limit: limit,
    ...(status && status !== "all" ? { p_status: status as DbStatus } : {}),
    ...(cursor ? { p_cursor_issue_date: cursor.issueDate, p_cursor_id: cursor.id } : {}),
  });

  if (error) {
    logger.error(
      { err: { code: error.code, message: error.message } },
      "listInvoicesPage: rpc failed",
    );
    return { rows: [], nextCursor: null };
  }

  const rows = (data ?? []).map(mapRpcRowToInvoice);
  const lastRow = data && data.length > 0 ? data[data.length - 1] : null;
  const nextCursor: InvoicePageCursor | null =
    data && data.length >= limit && lastRow
      ? { issueDate: lastRow.issue_date, id: lastRow.id }
      : null;

  return { rows, nextCursor };
}

const STATUS_FILTER_KEYS: ReadonlyArray<InvoiceStatusFilter> = [
  "all",
  "paid",
  "sent",
  "viewed",
  "overdue",
  "draft",
];

export async function getInvoiceStatusCounts(): Promise<InvoiceStatusCounts> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("invoice_status_counts");

  if (error) {
    logger.error(
      { err: { code: error.code, message: error.message } },
      "getInvoiceStatusCounts: rpc failed",
    );
    return {};
  }

  const counts: InvoiceStatusCounts = {};
  let total = 0;

  for (const row of data ?? []) {
    const key = row.status as InvoiceStatusFilter;
    if (STATUS_FILTER_KEYS.includes(key)) {
      counts[key] = Number(row.count);
      total += Number(row.count);
    }
  }
  counts["all"] = total;

  return counts;
}
