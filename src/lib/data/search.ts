import "server-only";

import { createClient } from "@/lib/supabase/server";
import logger from "@/lib/logger";
import { isAbortError } from "@/lib/supabase/is-abort-error";
import { formatPaise } from "@/lib/utils";
import type { Json } from "@/lib/types/database";
import type { SearchResults, SearchInvoiceHit, SearchCustomerHit } from "@/lib/types/search";
import { EMPTY_SEARCH_RESULTS } from "@/lib/types/search";

function isJsonObject(v: Json): v is Record<string, Json> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function toStr(v: Json | undefined, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function toNum(v: Json | undefined, fallback = 0): number {
  return typeof v === "number" ? v : fallback;
}

function parseInvoiceHit(row: Json): SearchInvoiceHit | null {
  if (!isJsonObject(row)) return null;
  const uuid = toStr(row.id);
  if (!uuid) return null;
  const totalPaise = toNum(row.total);
  return {
    kind: "invoice",
    id: row.number ? `#${toStr(row.number)}` : `#${uuid.slice(0, 8).toUpperCase()}`,
    invoiceUuid: uuid,
    number: typeof row.number === "string" ? row.number : null,
    customerName: typeof row.customer_name === "string" ? row.customer_name : null,
    isoDate: toStr(row.issue_date),
    amount: formatPaise(totalPaise),
    totalPaise,
    status: toStr(row.status),
  };
}

function parseCustomerHit(row: Json): SearchCustomerHit | null {
  if (!isJsonObject(row)) return null;
  const id = toStr(row.id);
  if (!id) return null;
  return {
    kind: "customer",
    id,
    name: toStr(row.name),
    phone: typeof row.phone === "string" ? row.phone : null,
  };
}

async function resolveBusinessId(
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

export async function searchAll(query: string): Promise<SearchResults> {
  const supabase = await createClient();

  const businessId = await resolveBusinessId(supabase);
  if (!businessId) return { ...EMPTY_SEARCH_RESULTS };

  const { data, error } = await supabase.rpc("search_all", {
    p_business_id: businessId,
    p_query: query,
  });

  if (error) {
    if (!isAbortError(error)) {
      logger.error({ err: { code: error.code, message: error.message } }, "searchAll: RPC failed");
    }
    return { ...EMPTY_SEARCH_RESULTS };
  }

  const rows = data ?? [];
  const invoices: SearchInvoiceHit[] = [];
  const customers: SearchCustomerHit[] = [];

  for (const row of rows) {
    if (!isJsonObject(row)) continue;
    if (row.kind === "invoice") {
      const hit = parseInvoiceHit(row);
      if (hit) invoices.push(hit);
    } else if (row.kind === "customer") {
      const hit = parseCustomerHit(row);
      if (hit) customers.push(hit);
    }
  }

  return { invoices, customers };
}
