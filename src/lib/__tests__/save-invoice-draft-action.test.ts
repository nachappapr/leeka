import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/env.server", () => ({
  serverEnv: {},
  isWhatsAppConfigured: () => false,
  isWhatsAppWebhookConfigured: () => false,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  default: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import { createClient } from "@/lib/supabase/server";
import { saveInvoiceDraft } from "@/app/(app)/invoices/actions";

const mockCreateClient = vi.mocked(createClient);

const validPayload = {
  customerId: "123e4567-e89b-12d3-a456-426614174000",
  items: [
    {
      name: "Consulting",
      qty: 1,
      unit_price: 100000,
      discount: 0,
      gst_rate: 18,
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("saveInvoiceDraft — validation guard", () => {
  it("returns ok:false for an invalid payload without calling createClient", async () => {
    const result = await saveInvoiceDraft({ customerId: "not-a-uuid", items: [] });

    expect(result.ok).toBe(false);
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("returns ok:false with a descriptive error for missing customerId", async () => {
    const result = await saveInvoiceDraft({ items: validPayload.items });

    expect(result.ok).toBe(false);
    expect(mockCreateClient).not.toHaveBeenCalled();
  });
});

type ClientStub = Pick<Awaited<ReturnType<typeof createClient>>, "auth">;
type AuthStub = Pick<ClientStub["auth"], "getUser">;

describe("saveInvoiceDraft — auth guard", () => {
  it("returns ok:false with 'Not authenticated' when getUser returns null user", async () => {
    const authStub: AuthStub = {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    };
    mockCreateClient.mockResolvedValue({
      auth: authStub as ClientStub["auth"],
    } as Awaited<ReturnType<typeof createClient>>);

    const result = await saveInvoiceDraft(validPayload);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Not authenticated");
    }
  });
});
