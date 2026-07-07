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
import { deleteCustomerAction } from "@/app/(app)/customers/actions";

const mockCreateClient = vi.mocked(createClient);
const mockRevalidate = vi.mocked(revalidateBusiness);

const VALID_CUSTOMER_ID = "123e4567-e89b-12d3-a456-426614174000";
const BUSINESS_ID = "00000000-0000-0000-0000-000000000010";
const USER_ID = "00000000-0000-0000-0000-000000000001";

type RpcResult = { data: unknown; error: { code?: string; message: string } | null };

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// The Supabase server client exposes 120+ members across auth/postgrest/realtime;
// this stub implements only the handful deleteCustomerAction touches, so the partial
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

describe("deleteCustomerAction — validation guard", () => {
  it("returns ok:false for a non-uuid customerId without calling createClient", async () => {
    const result = await deleteCustomerAction("not-a-uuid");

    expect(result.ok).toBe(false);
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("returns ok:false for an empty customerId without calling createClient", async () => {
    const result = await deleteCustomerAction("");

    expect(result.ok).toBe(false);
    expect(mockCreateClient).not.toHaveBeenCalled();
  });
});

describe("deleteCustomerAction — auth + business guards", () => {
  it("returns 'Not authenticated' when there is no user", async () => {
    const { client } = makeClient({ user: null });
    mockCreateClient.mockResolvedValue(client);

    const result = await deleteCustomerAction(VALID_CUSTOMER_ID);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Not authenticated");
    expect(mockRevalidate).not.toHaveBeenCalled();
  });

  it("returns 'No business found' when the user has no membership", async () => {
    const { client } = makeClient({ user: { id: USER_ID }, businessId: null });
    mockCreateClient.mockResolvedValue(client);

    const result = await deleteCustomerAction(VALID_CUSTOMER_ID);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("No business found for this account");
    expect(mockRevalidate).not.toHaveBeenCalled();
  });
});

describe("deleteCustomerAction — RPC behaviour", () => {
  it("returns ok:false and does not revalidate when the RPC errors", async () => {
    const { client, rpc } = makeClient({
      user: { id: USER_ID },
      businessId: BUSINESS_ID,
      rpc: { data: null, error: { code: "P0001", message: "not a member of this business" } },
    });
    mockCreateClient.mockResolvedValue(client);

    const result = await deleteCustomerAction(VALID_CUSTOMER_ID);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Failed to delete customer. Please try again.");
    }
    expect(rpc).toHaveBeenCalledWith("delete_customer", {
      p_business_id: BUSINESS_ID,
      p_customer_id: VALID_CUSTOMER_ID,
    });
    expect(mockRevalidate).not.toHaveBeenCalled();
  });

  it("returns ok:true, calls the RPC with resolved args, and revalidates on success", async () => {
    const { client, rpc } = makeClient({
      user: { id: USER_ID },
      businessId: BUSINESS_ID,
      rpc: { data: true, error: null },
    });
    mockCreateClient.mockResolvedValue(client);

    const result = await deleteCustomerAction(VALID_CUSTOMER_ID);

    expect(result.ok).toBe(true);
    expect(rpc).toHaveBeenCalledWith("delete_customer", {
      p_business_id: BUSINESS_ID,
      p_customer_id: VALID_CUSTOMER_ID,
    });
    expect(mockRevalidate).toHaveBeenCalledWith(BUSINESS_ID);
  });
});
