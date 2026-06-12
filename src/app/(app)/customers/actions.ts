"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { CustomerSchema } from "@/lib/schema/customer";
import logger from "@/lib/logger";
import type { CustomerSavePayload, SelectedCustomer } from "@/lib/types";

export type UpsertCustomerResult =
  | {
      ok: true;
      data: {
        id: string;
        name: string;
        phone: string;
        email: string | null;
        gstin: string | null;
        state_code: string | null;
        city: string | null;
        billing_address: string | null;
      };
    }
  | { ok: false; error: string };

export type SearchCustomersResult =
  | { ok: true; data: SelectedCustomer[] }
  | { ok: false; error: string };

async function getBusinessId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<string | null> {
  const { data: member } = await supabase
    .from("business_members")
    .select("business_id")
    .eq("user_id", userId)
    .single();
  return member?.business_id ?? null;
}

export async function upsertCustomerAction(
  payload: CustomerSavePayload,
): Promise<UpsertCustomerResult> {
  const parsed = CustomerSchema.safeParse({
    name: payload.name,
    phone: payload.phone,
    email: payload.email ?? "",
    gstin: payload.gstin ?? "",
    billingAddress: payload.address ?? "",
    // openingBalance intentionally excluded: upsert_customer RPC has no p_opening_balance param
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const businessId = await getBusinessId(supabase, user.id);
  if (!businessId) {
    return { ok: false, error: "No business found for this account" };
  }

  const { name, phone, email, gstin, billingAddress } = parsed.data;

  const { data, error } = await supabase.rpc("upsert_customer", {
    p_business_id: businessId,
    p_name: name,
    p_customer_id: payload.id ?? undefined,
    p_phone: phone ?? "",
    p_email: email ?? "",
    p_gstin: gstin ?? "",
    p_state_code: "",
    p_city: "",
    p_billing_address: billingAddress ?? "",
    p_notes: "",
  });

  if (error) {
    logger.error(
      { err: { code: error.code }, userId: user.id },
      "upsertCustomerAction: RPC failed",
    );
    return { ok: false, error: "Failed to save customer. Please try again." };
  }

  return {
    ok: true,
    data: data as {
      id: string;
      name: string;
      phone: string;
      email: string | null;
      gstin: string | null;
      state_code: string | null;
      city: string | null;
      billing_address: string | null;
    },
  };
}

const SearchQuerySchema = z.string().max(200);

export async function searchCustomersAction(query: string): Promise<SearchCustomersResult> {
  const parsed = SearchQuerySchema.safeParse(query);
  if (!parsed.success) {
    return { ok: false, error: "Invalid search query" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const businessId = await getBusinessId(supabase, user.id);
  if (!businessId) {
    return { ok: false, error: "No business found for this account" };
  }

  const { data, error } = await supabase.rpc("search_customers", {
    p_business_id: businessId,
    p_query: parsed.data,
  });

  if (error) {
    logger.error(
      { err: { code: error.code }, userId: user.id },
      "searchCustomersAction: RPC failed",
    );
    return { ok: false, error: "Failed to search customers. Please try again." };
  }

  const results =
    (data as Array<{
      id: string;
      name: string;
      phone: string;
      email: string | null;
      state_code: string | null;
    }> | null) ?? [];

  return {
    ok: true,
    data: results.map((row) => ({
      id: row.id,
      name: row.name,
      phone: row.phone ?? "",
      state_code: row.state_code,
    })),
  };
}
