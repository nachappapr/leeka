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
import { markInvoiceUnpaid } from "@/app/(app)/invoices/actions";

const mockCreateClient = vi.mocked(createClient);
const mockRevalidate = vi.mocked(revalidateBusiness);

const VALID_INVOICE_ID = "123e4567-e89b-12d3-a456-426614174000";
const BUSINESS_ID = "00000000-0000-0000-0000-000000000010";
const USER_ID = "00000000-0000-0000-0000-000000000001";

type RpcResult = { data: unknown; error: { code?: string; message: string } | null };

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// The Supabase server client exposes 120+ members across auth/postgrest/realtime;
// this stub implements only the handful markInvoiceUnpaid touches, so the partial
// shape is widened to the full client type at this single boundary.
function makeClient(opts: {
  user: { id: string } | null;
  businessId?: string | null;
  rpc?: RpcResult;
}): {
  client: SupabaseServerClient;
  rpc: ReturnType<typeof vi.fn>;
  rpcSingle: ReturnType<typeof vi.fn>;
} {
  const rpcSingle = vi.fn().mockResolvedValue(opts.rpc ?? { data: null, error: null });
  const rpc = vi.fn().mockReturnValue({ single: rpcSingle });

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

  return { client: client as unknown as SupabaseServerClient, rpc, rpcSingle };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("markInvoiceUnpaid — validation guard", () => {
  it("returns ok:false for a non-uuid invoiceId without calling createClient", async () => {
    const result = await markInvoiceUnpaid({ invoiceId: "not-a-uuid" });

    expect(result.ok).toBe(false);
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("returns ok:false for a missing invoiceId", async () => {
    const result = await markInvoiceUnpaid({});

    expect(result.ok).toBe(false);
    expect(mockCreateClient).not.toHaveBeenCalled();
  });
});

describe("markInvoiceUnpaid — auth + business guards", () => {
  it("returns 'Not authenticated' when there is no user", async () => {
    const { client } = makeClient({ user: null });
    mockCreateClient.mockResolvedValue(client);

    const result = await markInvoiceUnpaid({ invoiceId: VALID_INVOICE_ID });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Not authenticated");
  });

  it("returns 'No business found' when the user has no membership", async () => {
    const { client } = makeClient({ user: { id: USER_ID }, businessId: null });
    mockCreateClient.mockResolvedValue(client);

    const result = await markInvoiceUnpaid({ invoiceId: VALID_INVOICE_ID });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("No business found for this account");
  });
});

describe("markInvoiceUnpaid — RPC behaviour", () => {
  it("surfaces a friendly error when the RPC rejects a gateway payment", async () => {
    const { client } = makeClient({
      user: { id: USER_ID },
      businessId: BUSINESS_ID,
      rpc: { data: null, error: { code: "P0001", message: "cannot reverse a gateway payment" } },
    });
    mockCreateClient.mockResolvedValue(client);

    const result = await markInvoiceUnpaid({ invoiceId: VALID_INVOICE_ID });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(
        "This payment was confirmed by a gateway and cannot be undone from the app",
      );
    }
    expect(mockRevalidate).not.toHaveBeenCalled();
  });

  it("surfaces a friendly error when the invoice is not paid", async () => {
    const { client } = makeClient({
      user: { id: USER_ID },
      businessId: BUSINESS_ID,
      rpc: { data: null, error: { code: "P0001", message: "invoice is not paid" } },
    });
    mockCreateClient.mockResolvedValue(client);

    const result = await markInvoiceUnpaid({ invoiceId: VALID_INVOICE_ID });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("This invoice is not marked as paid");
  });

  it("returns the recomputed status on success and calls the RPC with the resolved business id", async () => {
    const { client, rpc } = makeClient({
      user: { id: USER_ID },
      businessId: BUSINESS_ID,
      rpc: { data: { invoice_id: VALID_INVOICE_ID, status: "overdue" }, error: null },
    });
    mockCreateClient.mockResolvedValue(client);

    const result = await markInvoiceUnpaid({ invoiceId: VALID_INVOICE_ID });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.invoiceId).toBe(VALID_INVOICE_ID);
      expect(result.data.status).toBe("overdue");
    }
    expect(rpc).toHaveBeenCalledWith("mark_invoice_unpaid", {
      p_business_id: BUSINESS_ID,
      p_invoice_id: VALID_INVOICE_ID,
    });
    expect(mockRevalidate).toHaveBeenCalledWith(BUSINESS_ID);
  });
});
