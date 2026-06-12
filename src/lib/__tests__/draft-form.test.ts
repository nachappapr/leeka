import { describe, it, expect } from "vitest";
import { toDraftSavePayload, estimateDraftTotals } from "@/lib/invoice/draft-form";
import { computeTotals } from "@/lib/invoice/compute-totals";
import { DraftFormSchema, SaveInvoiceDraftSchema } from "@/lib/schema/invoice";
import type { DraftFormData } from "@/lib/schema/invoice";

const customerId = "123e4567-e89b-12d3-a456-426614174000";

const formData: DraftFormData = {
  items: [
    {
      name: "Consulting",
      qty: 2,
      unit_price: 500000,
      discount: 0,
      gst_rate: 18,
    },
  ],
  notes: "",
};

describe("toDraftSavePayload", () => {
  it("round-trips through SaveInvoiceDraftSchema.safeParse successfully", () => {
    const payload = toDraftSavePayload(customerId, formData);
    const result = SaveInvoiceDraftSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("converts empty-string notes to undefined so schema stays valid", () => {
    const payload = toDraftSavePayload(customerId, { ...formData, notes: "" });
    // notes: "" → undefined after || undefined; schema allows undefined
    expect(payload.notes).toBeUndefined();
    expect(SaveInvoiceDraftSchema.safeParse(payload).success).toBe(true);
  });

  it("converts empty-string hsn_sac to undefined so schema stays valid", () => {
    const dataWithEmptyHsn: DraftFormData = {
      ...formData,
      items: [{ ...formData.items[0], hsn_sac: "" }],
    };
    const payload = toDraftSavePayload(customerId, dataWithEmptyHsn);
    expect(payload.items[0].hsn_sac).toBeUndefined();
    expect(SaveInvoiceDraftSchema.safeParse(payload).success).toBe(true);
  });

  it("preserves invoiceId when provided", () => {
    const invoiceId = "550e8400-e29b-41d4-a716-446655440000";
    const payload = toDraftSavePayload(customerId, formData, invoiceId);
    expect(payload.invoiceId).toBe(invoiceId);
    expect(SaveInvoiceDraftSchema.safeParse(payload).success).toBe(true);
  });
});

describe("DraftFormSchema → SaveInvoiceDraftSchema alignment", () => {
  it("DraftFormSchema output round-trips through SaveInvoiceDraftSchema via toDraftSavePayload", () => {
    const rawInput = {
      items: [{ name: "Consulting", qty: 2, unit_price: 500000, discount: 0, gst_rate: 18 }],
      notes: "",
    };
    const parsed = DraftFormSchema.safeParse(rawInput);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    const payload = toDraftSavePayload(customerId, parsed.data);
    const result = SaveInvoiceDraftSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("DraftFormSchema rejects non-number qty (plain z.number() — no coercion)", () => {
    const result = DraftFormSchema.safeParse({
      items: [{ name: "Consulting", qty: "2", unit_price: 500000, discount: 0, gst_rate: 18 }],
      notes: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("estimateDraftTotals vs computeTotals", () => {
  it("produces identical output to computeTotals for the same items", () => {
    const items = formData.items;

    const estimate = estimateDraftTotals(items);
    const computed = computeTotals(
      items.map((it) => ({
        name: it.name ?? "",
        qty: it.qty ?? 0,
        unit_price: it.unit_price ?? 0,
        discount: it.discount ?? 0,
        gst_rate: it.gst_rate ?? 0,
      })),
    );

    expect(estimate).toEqual(computed);
  });
});
