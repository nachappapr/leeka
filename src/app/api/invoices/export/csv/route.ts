import "server-only";
import { createClient } from "@/lib/supabase/server";
import logger from "@/lib/logger";
import { ExportCsvQuerySchema } from "@/lib/schema/invoice-export";
import { buildCsvBody } from "@/lib/invoice/export-csv";
import type { ExportInvoiceRow } from "@/lib/invoice/export-csv";

// The nested-select shape returned by Supabase for the invoices query.
// Defined here because the generated Database types do not model nested join
// shapes — the fields precisely match the .select() projection below.
interface InvoiceExportRow {
  number: string | null;
  issue_date: string;
  status: string;
  place_of_supply: string | null;
  is_interstate: boolean;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  tax_total: number;
  total: number;
  customers: { name: string; gstin: string | null } | null;
  invoice_line_items: Array<{ hsn_sac: string | null }>;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9._-]/gi, "-").toLowerCase();
}

function buildFilename(from: string | undefined, to: string | undefined): string {
  if (from && to) {
    return `arthapatra-invoices-${sanitizeFilename(from)}-${sanitizeFilename(to)}.csv`;
  }
  if (from) {
    return `arthapatra-invoices-from-${sanitizeFilename(from)}.csv`;
  }
  if (to) {
    return `arthapatra-invoices-to-${sanitizeFilename(to)}.csv`;
  }
  return "arthapatra-invoices.csv";
}

export async function GET(request: Request): Promise<Response> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const { data: member } = await supabase
    .from("business_members")
    .select("business_id")
    .eq("user_id", user.id)
    .single();

  const businessId = member?.business_id ?? null;
  if (!businessId) {
    return Response.json(
      { ok: false, error: "No business found for this account" },
      { status: 404 },
    );
  }

  // Parse and validate query params
  const { searchParams } = new URL(request.url);
  const rawParams = {
    statuses: searchParams.get("statuses") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    customer: searchParams.get("customer") ?? undefined,
  };

  const parsed = ExportCsvQuerySchema.safeParse(rawParams);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid query parameters" },
      { status: 400 },
    );
  }

  const { statuses, from, to, customer } = parsed.data;

  // ── Vendor GSTIN ──────────────────────────────────────────────────────────
  const { data: businessRow, error: businessErr } = await supabase
    .from("businesses")
    .select("gstin")
    .eq("id", businessId)
    .single();

  if (businessErr) {
    logger.error(
      { err: { code: businessErr.code, message: businessErr.message } },
      "exportInvoicesCsv: failed to fetch business gstin",
    );
    return Response.json({ ok: false, error: "Failed to load business data" }, { status: 500 });
  }

  const vendorGstin = businessRow?.gstin ?? null;

  // ── Invoice query ─────────────────────────────────────────────────────────
  let query = supabase
    .from("invoices")
    .select(
      "number, issue_date, status, place_of_supply, is_interstate, subtotal, cgst, sgst, igst, tax_total, total, customers(name, gstin), invoice_line_items(hsn_sac)",
    )
    .eq("business_id", businessId)
    // Cancelled invoices are excluded from GSTR-1 filing; always omit them
    .neq("status", "cancelled")
    .order("issue_date", { ascending: true })
    .order("number", { ascending: true });

  if (statuses && statuses.length > 0) {
    query = query.in("status", statuses);
  }

  if (from) {
    query = query.gte("issue_date", from);
  }

  if (to) {
    query = query.lte("issue_date", to);
  }

  const { data: invoiceRows, error: invoicesErr } = await query;

  if (invoicesErr) {
    logger.error(
      { err: { code: invoicesErr.code, message: invoicesErr.message } },
      "exportInvoicesCsv: invoices query failed",
    );
    return Response.json({ ok: false, error: "Failed to fetch invoices" }, { status: 500 });
  }

  // Cast to the precise nested shape — Supabase's PostgREST client returns the
  // joined data but the generated types do not model it; the interface above
  // exactly mirrors the .select() projection.
  const rows = (invoiceRows ?? []) as unknown as InvoiceExportRow[];

  // Customer filter is post-applied in TypeScript (exact name match).
  // A SQL .eq("customers.name", x) join filter is not supported on embedded
  // relations in the Supabase JS client; post-filtering is O(n) and acceptable
  // for the vendor invoice counts expected here.
  const filtered = customer ? rows.filter((r) => r.customers?.name === customer) : rows;

  const exportRows: ExportInvoiceRow[] = filtered.map((r) => ({
    number: r.number,
    issue_date: r.issue_date,
    status: r.status,
    customer_name: r.customers?.name ?? null,
    customer_gstin: r.customers?.gstin ?? null,
    vendor_gstin: vendorGstin,
    place_of_supply: r.place_of_supply,
    is_interstate: r.is_interstate,
    hsn_sac_values: r.invoice_line_items.map((li) => li.hsn_sac ?? "").filter((v) => v !== ""),
    subtotal: r.subtotal,
    cgst: r.cgst,
    sgst: r.sgst,
    igst: r.igst,
    tax_total: r.tax_total,
    total: r.total,
  }));

  const csvBody = buildCsvBody(exportRows);
  const filename = buildFilename(from, to);

  return new Response(csvBody, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
