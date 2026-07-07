import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/env.server", () => ({
  serverEnv: {},
  isWhatsAppConfigured: () => false,
  isEmailConfigured: () => false,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/cache/revalidate-business", () => ({
  revalidateBusiness: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  default: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import { createClient } from "@/lib/supabase/server";
import { revalidateBusiness } from "@/lib/cache/revalidate-business";
import { upsertCustomerAction } from "@/app/(app)/customers/actions";
import type { CustomerSavePayload } from "@/lib/types/customer";

const mockCreateClient = vi.mocked(createClient);
const mockRevalidate = vi.mocked(revalidateBusiness);

const BUSINESS_ID = "00000000-0000-0000-0000-000000000010";
const USER_ID = "00000000-0000-0000-0000-000000000001";
const CUSTOMER_ID = "00000000-0000-0000-0000-000000000099";

type RpcResult = { data: unknown; error: { code?: string; message: string } | null };

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const VALID_PAYLOAD: CustomerSavePayload = {
  name: "Anita Rao",
  phone: "9876543210",
  email: "anita@example.com",
  gstin: "",
  address: "12 MG Road",
};

const RPC_ROW = {
  id: CUSTOMER_ID,
  name: "Anita Rao",
  phone: "9876543210",
  email: "anita@example.com",
  gstin: null,
  state_code: null,
  city: null,
  billing_address: "12 MG Road",
};

// The Supabase server client exposes 120+ members across auth/postgrest/realtime;
// this stub implements only the handful upsertCustomerAction touches, so the partial
// shape is widened to the full client type at this single boundary.
function makeClient(opts: {
  user: { id: string } | null;
  businessId?: string | null;
  rpc?: RpcResult;
}): {
  client: SupabaseServerClient;
  rpc: ReturnType<typeof vi.fn>;
} {
  const rpc = vi.fn().mockResolvedValue(opts.rpc ?? { data: null, error: null });

  const client = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: opts.user }, error: null }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: opts.businessId ? { business_id: opts.businessId } : null,
            error: null,
          }),
        }),
      }),
    }),
    rpc,
  };

  return { client: client as unknown as SupabaseServerClient, rpc };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("upsertCustomerAction — validation guard", () => {
  it("returns ok:false for an empty name without calling createClient", async () => {
    const result = await upsertCustomerAction({ ...VALID_PAYLOAD, name: "" });

    expect(result.ok).toBe(false);
    expect(mockCreateClient).not.toHaveBeenCalled();
    expect(mockRevalidate).not.toHaveBeenCalled();
  });

  it("returns ok:false for an invalid phone without calling createClient", async () => {
    const result = await upsertCustomerAction({ ...VALID_PAYLOAD, phone: "12345" });

    expect(result.ok).toBe(false);
    expect(mockCreateClient).not.toHaveBeenCalled();
    expect(mockRevalidate).not.toHaveBeenCalled();
  });
});

describe("upsertCustomerAction — auth + business guards", () => {
  it("returns 'Not authenticated' when there is no user", async () => {
    const { client, rpc } = makeClient({ user: null });
    mockCreateClient.mockResolvedValue(client);

    const result = await upsertCustomerAction(VALID_PAYLOAD);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Not authenticated");
    expect(rpc).not.toHaveBeenCalled();
    expect(mockRevalidate).not.toHaveBeenCalled();
  });

  it("returns ok:false when the user has no business membership", async () => {
    const { client, rpc } = makeClient({ user: { id: USER_ID }, businessId: null });
    mockCreateClient.mockResolvedValue(client);

    const result = await upsertCustomerAction(VALID_PAYLOAD);

    expect(result.ok).toBe(false);
    expect(rpc).not.toHaveBeenCalled();
    expect(mockRevalidate).not.toHaveBeenCalled();
  });
});

describe("upsertCustomerAction — RPC behaviour", () => {
  it("inserts a new customer, calls the RPC with the exact args, and revalidates once", async () => {
    const { client, rpc } = makeClient({
      user: { id: USER_ID },
      businessId: BUSINESS_ID,
      rpc: { data: RPC_ROW, error: null },
    });
    mockCreateClient.mockResolvedValue(client);

    const result = await upsertCustomerAction(VALID_PAYLOAD);

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.id).toBe(CUSTOMER_ID);

    expect(rpc).toHaveBeenCalledWith("upsert_customer", {
      p_business_id: BUSINESS_ID,
      p_name: "Anita Rao",
      p_customer_id: undefined,
      p_phone: "9876543210",
      p_email: "anita@example.com",
      p_gstin: "",
      p_state_code: "",
      p_city: "",
      p_billing_address: "12 MG Road",
      p_notes: "",
    });
    expect(mockRevalidate).toHaveBeenCalledTimes(1);
    expect(mockRevalidate).toHaveBeenCalledWith(BUSINESS_ID);
  });

  it("edits an existing customer, passing p_customer_id through, and revalidates once", async () => {
    const { client, rpc } = makeClient({
      user: { id: USER_ID },
      businessId: BUSINESS_ID,
      rpc: { data: RPC_ROW, error: null },
    });
    mockCreateClient.mockResolvedValue(client);

    const result = await upsertCustomerAction({ ...VALID_PAYLOAD, id: CUSTOMER_ID });

    expect(result.ok).toBe(true);
    expect(rpc).toHaveBeenCalledWith(
      "upsert_customer",
      expect.objectContaining({ p_customer_id: CUSTOMER_ID }),
    );
    expect(mockRevalidate).toHaveBeenCalledTimes(1);
    expect(mockRevalidate).toHaveBeenCalledWith(BUSINESS_ID);
  });

  it("surfaces a generic error and never revalidates when the RPC fails", async () => {
    const { client, rpc } = makeClient({
      user: { id: USER_ID },
      businessId: BUSINESS_ID,
      rpc: { data: null, error: { code: "P0001", message: "duplicate customer" } },
    });
    mockCreateClient.mockResolvedValue(client);

    const result = await upsertCustomerAction(VALID_PAYLOAD);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Failed to save customer. Please try again.");
    }
    expect(rpc).toHaveBeenCalled();
    expect(mockRevalidate).not.toHaveBeenCalled();
  });
});
