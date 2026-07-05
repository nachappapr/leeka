import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/env.server", () => ({
  serverEnv: {
    NEXT_PUBLIC_APP_URL: "https://app.test",
    WHATSAPP_PHONE_NUMBER_ID: "test-phone-id",
    WHATSAPP_ACCESS_TOKEN: "test-access-token",
    WHATSAPP_TEMPLATE_NAME: "arthapatra_invoice",
    WHATSAPP_RECEIPT_TEMPLATE_NAME: "arthapatra_receipt_v1",
    WHATSAPP_API_VERSION: "v21.0",
  },
  isWhatsAppConfigured: vi.fn(() => false),
  isEmailConfigured: vi.fn(() => false),
  isWhatsAppReceiptConfigured: vi.fn(() => false),
  isWhatsAppWebhookConfigured: vi.fn(() => false),
  isEmailWebhookConfigured: vi.fn(() => false),
  isRazorpayConfigured: vi.fn(() => false),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/whatsapp/send", () => ({
  sendWhatsAppInvoice: vi.fn(),
  sendWhatsAppReceipt: vi.fn(),
}));

vi.mock("@/lib/email/send", () => ({
  sendEmailInvoice: vi.fn(),
}));

vi.mock("@/lib/cache/revalidate-business", () => ({
  revalidateBusiness: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  default: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import { createClient } from "@/lib/supabase/server";
import { isWhatsAppReceiptConfigured } from "@/lib/env.server";
import { sendWhatsAppReceipt } from "@/lib/whatsapp/send";
import { sendReceipt } from "@/app/(app)/invoices/actions";

const mockCreateClient = vi.mocked(createClient);
const mockIsWhatsAppReceiptConfigured = vi.mocked(isWhatsAppReceiptConfigured);
const mockSendWhatsAppReceipt = vi.mocked(sendWhatsAppReceipt);

const VALID_INVOICE_ID = "123e4567-e89b-12d3-a456-426614174000";
const BUSINESS_ID = "00000000-0000-0000-0000-000000000010";
const USER_ID = "00000000-0000-0000-0000-000000000001";
const LOG_ID = "aaaaaaaa-0000-0000-0000-000000000001";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

interface MakeClientOpts {
  user: { id: string } | null;
  businessId?: string | null;
  invoiceData?: Record<string, unknown> | null;
  invoiceError?: { code?: string; message: string } | null;
  messageLogId?: string;
}

/**
 * Builds a partial Supabase client stub covering the four tables sendReceipt touches:
 * business_members (membership lookup), invoices (invoice fetch),
 * message_log (dispatch log insert), and invoice_events (event insert).
 *
 * Returns the client and the raw insert mocks so tests can assert call args.
 */
function makeClient(opts: MakeClientOpts): {
  client: SupabaseServerClient;
  logInsert: ReturnType<typeof vi.fn>;
  eventInsert: ReturnType<typeof vi.fn>;
} {
  // ── message_log: insert({}) → { select } → { single } ────────────────────
  const logSingle = vi
    .fn()
    .mockResolvedValue({ data: { id: opts.messageLogId ?? LOG_ID }, error: null });
  const logSelect = vi.fn().mockReturnValue({ single: logSingle });
  const logInsert = vi.fn().mockReturnValue({ select: logSelect });

  // ── invoice_events: insert({}) → resolved { error: null } ────────────────
  const eventInsert = vi.fn().mockResolvedValue({ error: null });

  // ── invoices: select() → eq() → eq() → single() ──────────────────────────
  const invoiceSingle = vi
    .fn()
    .mockResolvedValue({ data: opts.invoiceData ?? null, error: opts.invoiceError ?? null });
  const invoiceEq2 = vi.fn().mockReturnValue({ single: invoiceSingle });
  const invoiceEq1 = vi.fn().mockReturnValue({ eq: invoiceEq2 });
  const invoiceSelect = vi.fn().mockReturnValue({ eq: invoiceEq1 });

  // ── business_members: select() → eq() → single() ─────────────────────────
  const memberSingle = vi.fn().mockResolvedValue({
    data: opts.businessId ? { business_id: opts.businessId } : null,
    error: null,
  });
  const memberEq = vi.fn().mockReturnValue({ single: memberSingle });
  const memberSelect = vi.fn().mockReturnValue({ eq: memberEq });

  const fromFn = vi.fn().mockImplementation((table: string) => {
    switch (table) {
      case "business_members":
        return { select: memberSelect };
      case "invoices":
        return { select: invoiceSelect };
      case "message_log":
        return { insert: logInsert };
      case "invoice_events":
        return { insert: eventInsert };
      default:
        return {};
    }
  });

  const client = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: opts.user }, error: null }),
    },
    from: fromFn,
  };

  return { client: client as unknown as SupabaseServerClient, logInsert, eventInsert };
}

const paidInvoice: Record<string, unknown> = {
  id: VALID_INVOICE_ID,
  number: "INV-001",
  status: "paid",
  public_token: "abc-public-token",
  total: 100000, // paise: ₹1,000
  amount_paid: 100000,
  customer_id: "cust-001",
  customers: { phone: "+919876543210", name: "Arjun Sharma" },
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Validation guard ──────────────────────────────────────────────────────────

describe("sendReceipt — validation guard", () => {
  it("returns ok:false for a non-uuid invoiceId without calling createClient", async () => {
    const result = await sendReceipt("not-a-uuid");

    expect(result.ok).toBe(false);
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("returns ok:false for a missing invoiceId (undefined)", async () => {
    const result = await sendReceipt(undefined);

    expect(result.ok).toBe(false);
    expect(mockCreateClient).not.toHaveBeenCalled();
  });
});

// ── Auth + business guards ────────────────────────────────────────────────────

describe("sendReceipt — auth + business guards", () => {
  it("returns 'Not authenticated' when there is no user", async () => {
    const { client } = makeClient({ user: null });
    mockCreateClient.mockResolvedValue(client);

    const result = await sendReceipt(VALID_INVOICE_ID);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Not authenticated");
  });

  it("returns 'No business found' when the user has no membership", async () => {
    const { client } = makeClient({ user: { id: USER_ID }, businessId: null });
    mockCreateClient.mockResolvedValue(client);

    const result = await sendReceipt(VALID_INVOICE_ID);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("No business found for this account");
  });
});

// ── Invoice guards ────────────────────────────────────────────────────────────

describe("sendReceipt — invoice guards", () => {
  it("returns 'Invoice not found' when the invoice does not exist", async () => {
    const { client } = makeClient({
      user: { id: USER_ID },
      businessId: BUSINESS_ID,
      invoiceData: null,
      invoiceError: { code: "PGRST116", message: "no rows" },
    });
    mockCreateClient.mockResolvedValue(client);

    const result = await sendReceipt(VALID_INVOICE_ID);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Invoice not found");
  });

  it("returns an error when invoice has no public_token (not yet issued)", async () => {
    const unissuedInvoice = { ...paidInvoice, public_token: null };
    const { client } = makeClient({
      user: { id: USER_ID },
      businessId: BUSINESS_ID,
      invoiceData: unissuedInvoice,
    });
    mockCreateClient.mockResolvedValue(client);

    const result = await sendReceipt(VALID_INVOICE_ID);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("not been issued yet");
  });

  it("returns an honest-receipt error when status is not 'paid'", async () => {
    const sentInvoice = { ...paidInvoice, status: "sent" };
    const { client } = makeClient({
      user: { id: USER_ID },
      businessId: BUSINESS_ID,
      invoiceData: sentInvoice,
    });
    mockCreateClient.mockResolvedValue(client);

    const result = await sendReceipt(VALID_INVOICE_ID);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Only paid invoices can have a receipt sent");
  });

  it("returns an error when customer has no phone number on file", async () => {
    const noPhoneInvoice = { ...paidInvoice, customers: { phone: null, name: "Arjun Sharma" } };
    const { client } = makeClient({
      user: { id: USER_ID },
      businessId: BUSINESS_ID,
      invoiceData: noPhoneInvoice,
    });
    mockCreateClient.mockResolvedValue(client);

    const result = await sendReceipt(VALID_INVOICE_ID);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Customer has no phone number on file");
  });
});

// ── ENV gate (skipped path) ───────────────────────────────────────────────────

describe("sendReceipt — ENV gate (skipped path)", () => {
  it("writes a message_log 'skipped' row + invoice_events 'receipt.dispatched' row and returns ok:true skipped", async () => {
    mockIsWhatsAppReceiptConfigured.mockReturnValue(false);

    const { client, logInsert, eventInsert } = makeClient({
      user: { id: USER_ID },
      businessId: BUSINESS_ID,
      invoiceData: paidInvoice,
      messageLogId: LOG_ID,
    });
    mockCreateClient.mockResolvedValue(client);

    const result = await sendReceipt(VALID_INVOICE_ID);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.outcome).toBe("skipped");
      expect(result.data.skipped).toBe(true);
      expect(result.data.invoiceId).toBe(VALID_INVOICE_ID);
      expect(result.data.messageLogId).toBe(LOG_ID);
    }

    // message_log insert: skipped status, whatsapp channel
    expect(logInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: "whatsapp",
        status: "skipped",
        provider_msg_id: null,
        error: "WhatsApp receipt not configured",
      }),
    );

    // invoice_events insert: type must be "receipt.dispatched", never the pay-link type
    expect(eventInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "receipt.dispatched",
        channel: "whatsapp",
      }),
    );

    expect(mockSendWhatsAppReceipt).not.toHaveBeenCalled();
  });
});

// ── Live dispatch ─────────────────────────────────────────────────────────────

describe("sendReceipt — live dispatch", () => {
  beforeEach(() => {
    mockIsWhatsAppReceiptConfigured.mockReturnValue(true);
  });

  it("returns ok:true with outcome 'sent' and writes a 'sent' event on success", async () => {
    mockSendWhatsAppReceipt.mockResolvedValue({ ok: true, providerMsgId: "wa_receipt_001" });

    const { client, logInsert, eventInsert } = makeClient({
      user: { id: USER_ID },
      businessId: BUSINESS_ID,
      invoiceData: paidInvoice,
      messageLogId: LOG_ID,
    });
    mockCreateClient.mockResolvedValue(client);

    const result = await sendReceipt(VALID_INVOICE_ID);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.outcome).toBe("sent");
      expect(result.data.skipped).toBeUndefined();
      expect(result.data.messageLogId).toBe(LOG_ID);
    }

    // Both log rows written with correct type and outcome
    expect(logInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: "whatsapp",
        status: "sent",
        provider_msg_id: "wa_receipt_001",
      }),
    );
    expect(eventInsert).toHaveBeenCalledWith(
      expect.objectContaining({ type: "receipt.dispatched", channel: "whatsapp" }),
    );

    // Builder receives amount (paise→rupees formatted) and invoice number
    expect(mockSendWhatsAppReceipt).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientPhone: "+919876543210",
        invoiceNumber: "INV-001",
        amount: expect.stringContaining("₹"),
        receiptUrl: expect.stringContaining("abc-public-token"),
      }),
    );
  });

  it("returns ok:false with a descriptive error and writes a 'failed' event on send failure", async () => {
    mockSendWhatsAppReceipt.mockResolvedValue({ ok: false, error: "Network timeout" });

    const { client, logInsert, eventInsert } = makeClient({
      user: { id: USER_ID },
      businessId: BUSINESS_ID,
      invoiceData: paidInvoice,
      messageLogId: LOG_ID,
    });
    mockCreateClient.mockResolvedValue(client);

    const result = await sendReceipt(VALID_INVOICE_ID);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("WhatsApp receipt send failed: Network timeout");
    }

    // Log row still written even on failure
    expect(logInsert).toHaveBeenCalledWith(
      expect.objectContaining({ channel: "whatsapp", status: "failed", error: "Network timeout" }),
    );
    expect(eventInsert).toHaveBeenCalledWith(
      expect.objectContaining({ type: "receipt.dispatched", channel: "whatsapp" }),
    );
  });

  it("uses NEXT_PUBLIC_APP_URL as the receipt URL base", async () => {
    mockSendWhatsAppReceipt.mockResolvedValue({ ok: true, providerMsgId: "wa_001" });

    const { client } = makeClient({
      user: { id: USER_ID },
      businessId: BUSINESS_ID,
      invoiceData: paidInvoice,
    });
    mockCreateClient.mockResolvedValue(client);

    await sendReceipt(VALID_INVOICE_ID);

    expect(mockSendWhatsAppReceipt).toHaveBeenCalledWith(
      expect.objectContaining({
        receiptUrl: "https://app.test/pay/abc-public-token",
      }),
    );
  });
});

// ── sendWhatsAppReceipt — builder assertions ──────────────────────────────────

describe("sendWhatsAppReceipt — builder", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends the receipt template (not the pay-link template) with amount + invoice number in body and receipt URL in button", async () => {
    /*
     * Use the actual (unmocked) builder so we can inspect the exact HTTP payload
     * sent to the WhatsApp Cloud API. The mocked @/lib/env.server provides
     * WHATSAPP_RECEIPT_TEMPLATE_NAME = "arthapatra_receipt_v1" and
     * WHATSAPP_TEMPLATE_NAME = "arthapatra_invoice" — the builder must use only
     * the receipt template name.
     */
    const { sendWhatsAppReceipt: realSend } =
      await vi.importActual<typeof import("@/lib/whatsapp/send")>("@/lib/whatsapp/send");

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ messages: [{ id: "wa_receipt_builder_001" }] }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await realSend({
      recipientPhone: "+919876543210",
      invoiceNumber: "INV-001",
      amount: "₹1,000",
      receiptUrl: "https://app.test/pay/abc-token-xyz",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.providerMsgId).toBe("wa_receipt_builder_001");
    }

    expect(mockFetch).toHaveBeenCalledOnce();
    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as Record<string, unknown>;
    const template = body.template as Record<string, unknown>;
    const components = template.components as Array<Record<string, unknown>>;

    // Uses the RECEIPT template, never the pay-link template
    expect(template.name).toBe("arthapatra_receipt_v1");
    expect(template.name).not.toBe("arthapatra_invoice");

    // Body component carries amount {{1}} and invoiceNumber {{2}}
    const bodyComp = components.find((c) => c.type === "body") as Record<string, unknown>;
    const bodyParams = bodyComp.parameters as Array<{ type: string; text: string }>;
    expect(bodyParams.some((p) => p.text === "₹1,000")).toBe(true);
    expect(bodyParams.some((p) => p.text === "INV-001")).toBe(true);

    // Button carries the receipt URL (not a "Pay now" payload)
    const btnComp = components.find((c) => c.type === "button") as Record<string, unknown>;
    const btnParams = btnComp.parameters as Array<{ type: string; text: string }>;
    expect(btnParams.some((p) => p.text.includes("abc-token-xyz"))).toBe(true);

    // No pay-CTA keywords in button params (view receipt semantics only)
    const btnTexts = btnParams.map((p) => p.text.toLowerCase());
    expect(btnTexts.every((t) => !t.includes("pay now"))).toBe(true);
  });
});
