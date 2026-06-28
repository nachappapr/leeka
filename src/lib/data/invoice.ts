import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cacheLife, cacheTag } from "next/cache";
import logger from "@/lib/logger";
import { isAbortError } from "@/lib/supabase/is-abort-error";
import { formatPaise } from "@/lib/utils";
import { invoicesTag } from "@/lib/constants/cache-tags";
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
    if (error.code !== "PGRST116" && !isAbortError(error)) {
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

/**
 * Loads a single invoice by UUID for the detail page — dynamic, uncached.
 *
 * Uses the RLS session client so ownership is enforced structurally: a row
 * that doesn't belong to the caller's business simply won't be returned.
 * Returns null for missing rows, RLS-hidden rows, and abort errors.
 *
 * Server-only: never import this in a Client Component.
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getInvoiceDetail(uuid: string) {
  // A non-UUID param (e.g. a stale mock display-id) would make Postgres throw
  // 22P02 on the uuid column; treat it as not-found instead of a logged error.
  if (!UUID_RE.test(uuid)) return null;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invoices")
    .select(
      `
      id,
      number,
      status,
      issue_date,
      due_date,
      notes,
      subtotal,
      tax_total,
      total,
      public_token,
      businesses ( name ),
      customers ( name, city ),
      invoice_line_items ( position, name, qty, unit_price )
    `,
    )
    .eq("id", uuid)
    .single();

  if (error) {
    if (error.code !== "PGRST116" && !isAbortError(error)) {
      logger.error({ err: { code: error.code } }, "getInvoiceDetail: query failed");
    }
    return null;
  }

  return data;
}

export type InvoiceDetailRow = NonNullable<Awaited<ReturnType<typeof getInvoiceDetail>>>;

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
  number: string | null;
  customer_name: string | null;
  customer_city: string | null;
  issue_date: string;
  created_at: string;
  total: number;
  status: DbStatus;
  public_token: string | null;
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
  const displayId = row.number ? `#${row.number}` : `#${row.id.slice(0, 8).toUpperCase()}`;
  return {
    id: displayId,
    invoiceUuid: row.id,
    publicToken: row.public_token ?? undefined,
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
  "use cache";
  cacheLife("minutes");
  cacheTag(invoicesTag(businessId));

  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc("list_invoices_page", {
    p_business_id: businessId,
    p_limit: limit + 1,
    ...(status && status !== "all" ? { p_status: status as DbStatus } : {}),
    ...(cursor
      ? {
          p_cursor_issue_date: cursor.issueDate,
          p_cursor_created_at: cursor.createdAt,
          p_cursor_id: cursor.id,
        }
      : {}),
  });

  if (error) {
    if (!isAbortError(error)) {
      logger.error(
        { err: { code: error.code, message: error.message } },
        "listInvoicesPage: rpc failed",
      );
    }
    return { rows: [], nextCursor: null };
  }

  const allRows = data ?? [];
  const hasMore = allRows.length > limit;
  const displayRows = hasMore ? allRows.slice(0, limit) : allRows;
  const rows = displayRows.map(mapRpcRowToInvoice);
  const lastDisplayed = displayRows.length > 0 ? displayRows[displayRows.length - 1] : null;
  const nextCursor: InvoicePageCursor | null =
    hasMore && lastDisplayed
      ? {
          issueDate: lastDisplayed.issue_date,
          createdAt: lastDisplayed.created_at,
          id: lastDisplayed.id,
        }
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

export async function getInvoiceStatusCounts({
  businessId,
}: {
  businessId: string;
}): Promise<InvoiceStatusCounts> {
  "use cache";
  cacheLife("minutes");
  cacheTag(invoicesTag(businessId));

  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc("invoice_status_counts", {
    p_business_id: businessId,
  });

  if (error) {
    if (!isAbortError(error)) {
      logger.error(
        { err: { code: error.code, message: error.message } },
        "getInvoiceStatusCounts: rpc failed",
      );
    }
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
