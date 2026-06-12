import { describe, it, expect } from "vitest";
import { DraftLineItemSchema, SaveInvoiceDraftSchema } from "@/lib/schema/invoice";

const validLine = {
  name: "Web Design",
  qty: 2,
  unit_price: 500000,
  discount: 0,
  gst_rate: 18,
};

const validPayload = {
  customerId: "123e4567-e89b-12d3-a456-426614174000",
  items: [validLine],
};

describe("DraftLineItemSchema", () => {
  it("accepts a valid line item", () => {
    expect(DraftLineItemSchema.safeParse(validLine).success).toBe(true);
  });

  it("rejects empty item name", () => {
    expect(DraftLineItemSchema.safeParse({ ...validLine, name: "" }).success).toBe(false);
  });

  it("rejects qty = 0", () => {
    expect(DraftLineItemSchema.safeParse({ ...validLine, qty: 0 }).success).toBe(false);
  });

  it("rejects qty < 0", () => {
    expect(DraftLineItemSchema.safeParse({ ...validLine, qty: -1 }).success).toBe(false);
  });

  it("rejects unit_price < 0", () => {
    expect(DraftLineItemSchema.safeParse({ ...validLine, unit_price: -1 }).success).toBe(false);
  });

  it("rejects discount < 0", () => {
    expect(DraftLineItemSchema.safeParse({ ...validLine, discount: -1 }).success).toBe(false);
  });

  it("rejects gst_rate < 0", () => {
    expect(DraftLineItemSchema.safeParse({ ...validLine, gst_rate: -1 }).success).toBe(false);
  });
});

describe("SaveInvoiceDraftSchema", () => {
  it("accepts a valid payload", () => {
    expect(SaveInvoiceDraftSchema.safeParse(validPayload).success).toBe(true);
  });

  it("rejects missing customerId", () => {
    expect(SaveInvoiceDraftSchema.safeParse({ items: validPayload.items }).success).toBe(false);
  });

  it("rejects malformed (non-uuid) customerId", () => {
    expect(
      SaveInvoiceDraftSchema.safeParse({ ...validPayload, customerId: "not-a-uuid" }).success,
    ).toBe(false);
  });

  it("rejects zero items (empty array)", () => {
    expect(SaveInvoiceDraftSchema.safeParse({ ...validPayload, items: [] }).success).toBe(false);
  });
});
