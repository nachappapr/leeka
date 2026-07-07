import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import logger from "@/lib/logger";
import { isAbortError } from "@/lib/supabase/is-abort-error";
import { resolveBusinessId } from "@/lib/data/invoice";
import type { Customer } from "@/lib/types/customer";
import type { CustomerPage, CustomerPageCursor } from "@/lib/types/customer";
import { cacheLife, cacheTag } from "next/cache";
import { dashboardTag, customersTag, invoicesTag } from "@/lib/constants/cache-tags";

interface ListCustomersPageArgs {
  businessId: string;
  cursor: CustomerPageCursor | null;
  limit?: number;
}

function mapRpcRowToCustomer(row: {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  gstin: string | null;
  billing_address: string | null;
  city: string | null;
  created_at: string;
}): Customer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone ?? "",
    email: row.email ?? undefined,
    gstin: row.gstin ?? undefined,
    address: row.billing_address ?? undefined,
    city: row.city ?? undefined,
    invoiceCount: 0,
    totalBilled: "₹0",
    outstanding: null,
    paid: "₹0",
    customerSince: row.created_at
      ? new Date(row.created_at).toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        })
      : undefined,
  };
}

export async function listCustomersPage({
  businessId,
  cursor,
  limit = 25,
}: ListCustomersPageArgs): Promise<CustomerPage> {
  "use cache";
  cacheLife("minutes");
  cacheTag(customersTag(businessId));

  const supabase = createAdminClient();

  const args = {
    p_business_id: businessId,
    p_limit: limit,
    ...(cursor ? { p_cursor_name: cursor.name, p_cursor_id: cursor.id } : {}),
  };

  const { data, error } = await supabase.rpc("list_customers_page", args);

  if (error) {
    if (!isAbortError(error)) {
      logger.error(
        { err: { code: error.code, message: error.message } },
        "listCustomersPage: rpc failed",
      );
    }
    return { rows: [], nextCursor: null };
  }

  const rows = (data ?? []).map(mapRpcRowToCustomer);
  const lastRow = data && data.length > 0 ? data[data.length - 1] : null;
  const nextCursor: CustomerPageCursor | null =
    data && data.length >= limit && lastRow ? { name: lastRow.name, id: lastRow.id } : null;

  return { rows, nextCursor };
}

export async function fetchCustomersFirstPage(limit = 25): Promise<CustomerPage> {
  const supabase = await createClient();
  const businessId = await resolveBusinessId(supabase);
  if (!businessId) return { rows: [], nextCursor: null };
  return listCustomersPage({ businessId, cursor: null, limit });
}

export async function businessHasCustomers({
  businessId,
}: {
  businessId: string;
}): Promise<boolean> {
  "use cache";
  cacheLife("minutes");
  cacheTag(dashboardTag(businessId), customersTag(businessId));

  const supabase = createAdminClient();

  const { count, error } = await supabase
    .from("customers")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)
    .is("deleted_at", null);

  if (error) {
    if (!isAbortError(error)) {
      logger.error(
        { err: { code: error.code, message: error.message } },
        "businessHasCustomers: query failed",
      );
    }
    return false;
  }

  return (count ?? 0) > 0;
}

interface GetCustomerDetailArgs {
  businessId: string;
  id: string;
}

export async function getCustomerDetail({ businessId, id }: GetCustomerDetailArgs) {
  "use cache";
  cacheLife("minutes");
  cacheTag(customersTag(businessId));

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("customers")
    .select("id, name, phone, email, gstin, billing_address, city, created_at")
    .eq("id", id)
    .eq("business_id", businessId)
    .is("deleted_at", null)
    .single();

  if (error) {
    if (error.code !== "PGRST116" && !isAbortError(error)) {
      logger.error(
        { err: { code: error.code, message: error.message } },
        "getCustomerDetail: query failed",
      );
    }
    return null;
  }

  return data;
}

export type CustomerDetailRow = NonNullable<Awaited<ReturnType<typeof getCustomerDetail>>>;

interface ListCustomerInvoicesArgs {
  businessId: string;
  customerId: string;
}

export async function listCustomerInvoices({ businessId, customerId }: ListCustomerInvoicesArgs) {
  "use cache";
  cacheLife("minutes");
  cacheTag(invoicesTag(businessId));

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("invoices")
    .select("id, number, status, issue_date, total, amount_paid, customer_id")
    .eq("customer_id", customerId)
    .eq("business_id", businessId)
    .order("issue_date", { ascending: false });

  if (error) {
    if (!isAbortError(error)) {
      logger.error(
        { err: { code: error.code, message: error.message } },
        "listCustomerInvoices: query failed",
      );
    }
    return [];
  }

  return data ?? [];
}

export type CustomerInvoiceRow = Awaited<ReturnType<typeof listCustomerInvoices>>[number];
