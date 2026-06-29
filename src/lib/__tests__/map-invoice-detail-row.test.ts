import { describe, it, expect } from "vitest";
import { mapInvoiceDetailRow } from "@/lib/invoice/map-invoice-detail-row";
import type { InvoiceDetailRow } from "@/lib/data/invoice";
import type { Database } from "@/lib/types/database";

type DbStatus = Database["public"]["Enums"]["invoice_status"];

function makeRow(overrides: Partial<InvoiceDetailRow> = {}): InvoiceDetailRow {
  return {
    id: "uuid-1234-5678-abcd",
    number: "INV-001",
    status: "sent",
    issue_date: "2026-06-01",
    due_date: "2026-07-01",
    notes: null,
    subtotal: 500000,
    tax_total: 25000,
    total: 525000,
    public_token: "tok_abc",
    gst_enabled: true,
    is_interstate: false,
    cgst: 12500,
    sgst: 12500,
    igst: 0,
    round_off: 0,
    viewed_at: null,
    businesses: { name: "Raj Kumar Trading" },
    customers: { name: "Mehta Store", city: "Mumbai" },
    invoice_line_items: [
      {
        position: 1,
        name: "Widget A",
        qty: 5,
        unit_price: 100000,
        gst_rate: 18,
        discount: 0,
        line_subtotal: 500000,
        hsn_sac: null,
      },
    ],
    invoice_events: [],
    payments: [],
    ...overrides,
  };
}

// ─── null row ────────────────────────────────────────────────────────────────

describe("mapInvoiceDetailRow — null row", () => {
  it("returns not-found for null", () => {
    expect(mapInvoiceDetailRow(null)).toEqual({ kind: "not-found" });
  });
});

// ─── draft redirect ───────────────────────────────────────────────────────────

describe("mapInvoiceDetailRow — draft row", () => {
  it("returns redirect-edit for a draft row", () => {
    const result = mapInvoiceDetailRow(makeRow({ status: "draft" }));
    expect(result).toEqual({ kind: "redirect-edit" });
  });
});

// ─── ok: customer + line items + stored totals ────────────────────────────────

describe("mapInvoiceDetailRow — sent row", () => {
  const row = makeRow();
  const result = mapInvoiceDetailRow(row);

  it("returns ok kind", () => {
    expect(result.kind).toBe("ok");
  });

  it("carries customer name and city", () => {
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.detail.customer).toBe("Mehta Store");
    expect(result.detail.city).toBe("Mumbai");
  });

  it("carries business name as issuerName", () => {
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.detail.issuerName).toBe("Raj Kumar Trading");
  });

  it("maps line items with name, qty, unitPrice, gstRate, discount, lineSubtotal and no hsnSac", () => {
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.detail.items).toEqual([
      {
        name: "Widget A",
        qty: 5,
        unitPrice: 100000,
        gstRate: 18,
        discount: 0,
        lineSubtotal: 500000,
      },
    ]);
  });

  it("carries through stored subtotal, taxTotal, total unchanged", () => {
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.detail.subtotal).toBe(500000);
    expect(result.detail.taxTotal).toBe(25000);
    expect(result.detail.total).toBe(525000);
  });

  it("maps status to sent StatusPillStatus", () => {
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.detail.status).toBe("sent");
  });
});

// ─── no recomputation: inconsistent totals pass through unchanged ─────────────

describe("mapInvoiceDetailRow — no recomputation invariant", () => {
  it("passes inconsistent stored totals through unchanged", () => {
    const row = makeRow({
      subtotal: 100000,
      tax_total: 99999,
      total: 1,
    });
    const result = mapInvoiceDetailRow(row);
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.detail.subtotal).toBe(100000);
    expect(result.detail.taxTotal).toBe(99999);
    expect(result.detail.total).toBe(1);
  });

  it("passes inconsistent stored line_subtotal through unchanged without recomputing", () => {
    const row = makeRow({
      invoice_line_items: [
        {
          position: 1,
          name: "Widget A",
          qty: 5,
          unit_price: 100000,
          gst_rate: 18,
          discount: 0,
          line_subtotal: 99999,
          hsn_sac: null,
        },
      ],
    });
    const result = mapInvoiceDetailRow(row);
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.detail.items[0].lineSubtotal).toBe(99999);
  });
});

// ─── cancelled row ────────────────────────────────────────────────────────────

describe("mapInvoiceDetailRow — cancelled row", () => {
  it("returns ok with status cancelled", () => {
    const result = mapInvoiceDetailRow(makeRow({ status: "cancelled" }));
    expect(result.kind).toBe("ok");
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.detail.status).toBe("cancelled");
  });
});

// ─── paid row ────────────────────────────────────────────────────────────────

describe("mapInvoiceDetailRow — paid row", () => {
  it("returns ok with status paid", () => {
    const result = mapInvoiceDetailRow(makeRow({ status: "paid" }));
    expect(result.kind).toBe("ok");
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.detail.status).toBe("paid");
  });
});

// ─── parameterized: every non-draft status maps to a valid StatusPillStatus ──

const NON_DRAFT_STATUSES: DbStatus[] = [
  "sent",
  "viewed",
  "partial",
  "pending",
  "paid",
  "overdue",
  "cancelled",
];

describe("mapInvoiceDetailRow — status mapping exhaustive", () => {
  for (const status of NON_DRAFT_STATUSES) {
    it(`maps db status "${status}" to an ok result`, () => {
      const result = mapInvoiceDetailRow(makeRow({ status }));
      expect(result.kind).toBe("ok");
      if (result.kind !== "ok") throw new Error("expected ok");
      expect(result.detail.status).toBe(status);
    });
  }
});

// ─── display id from number field ────────────────────────────────────────────

describe("mapInvoiceDetailRow — display id", () => {
  it("uses #number when number is present", () => {
    const result = mapInvoiceDetailRow(makeRow({ number: "INV-042" }));
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.detail.id).toBe("#INV-042");
  });

  it("falls back to first 8 chars of uuid uppercased when number is null", () => {
    const result = mapInvoiceDetailRow(makeRow({ number: null, id: "abcdef12-rest" }));
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.detail.id).toBe("#ABCDEF12");
  });
});

// ─── GST fields: intrastate ───────────────────────────────────────────────────

describe("mapInvoiceDetailRow — intrastate GST fields", () => {
  it("carries cgst and sgst through; igst is zero", () => {
    const row = makeRow({
      gst_enabled: true,
      is_interstate: false,
      cgst: 9000,
      sgst: 9000,
      igst: 0,
    });
    const result = mapInvoiceDetailRow(row);
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.detail.gstEnabled).toBe(true);
    expect(result.detail.isInterstate).toBe(false);
    expect(result.detail.cgst).toBe(9000);
    expect(result.detail.sgst).toBe(9000);
    expect(result.detail.igst).toBe(0);
  });
});

// ─── GST fields: interstate ───────────────────────────────────────────────────

describe("mapInvoiceDetailRow — interstate GST fields", () => {
  it("carries igst through; cgst and sgst are zero", () => {
    const row = makeRow({ gst_enabled: true, is_interstate: true, cgst: 0, sgst: 0, igst: 18000 });
    const result = mapInvoiceDetailRow(row);
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.detail.gstEnabled).toBe(true);
    expect(result.detail.isInterstate).toBe(true);
    expect(result.detail.igst).toBe(18000);
    expect(result.detail.cgst).toBe(0);
    expect(result.detail.sgst).toBe(0);
  });
});

// ─── GST disabled ────────────────────────────────────────────────────────────

describe("mapInvoiceDetailRow — GST disabled", () => {
  it("carries gstEnabled=false through unchanged", () => {
    const row = makeRow({ gst_enabled: false, cgst: 0, sgst: 0, igst: 0, tax_total: 0 });
    const result = mapInvoiceDetailRow(row);
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.detail.gstEnabled).toBe(false);
    expect(result.detail.cgst).toBe(0);
    expect(result.detail.sgst).toBe(0);
    expect(result.detail.igst).toBe(0);
  });
});

// ─── Round-off ────────────────────────────────────────────────────────────────

describe("mapInvoiceDetailRow — round-off", () => {
  it("carries non-zero round_off through unchanged", () => {
    const row = makeRow({ round_off: 37 });
    const result = mapInvoiceDetailRow(row);
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.detail.roundOff).toBe(37);
  });

  it("carries negative round_off through unchanged", () => {
    const row = makeRow({ round_off: -25 });
    const result = mapInvoiceDetailRow(row);
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.detail.roundOff).toBe(-25);
  });

  it("carries zero round_off through unchanged", () => {
    const row = makeRow({ round_off: 0 });
    const result = mapInvoiceDetailRow(row);
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.detail.roundOff).toBe(0);
  });
});

// ─── Mixed per-line GST rates ─────────────────────────────────────────────────

describe("mapInvoiceDetailRow — mixed per-line GST rates", () => {
  it("preserves each line's distinct gstRate and does not collapse them", () => {
    const row = makeRow({
      invoice_line_items: [
        {
          position: 1,
          name: "Item A",
          qty: 1,
          unit_price: 100000,
          gst_rate: 5,
          discount: 0,
          line_subtotal: 100000,
          hsn_sac: null,
        },
        {
          position: 2,
          name: "Item B",
          qty: 2,
          unit_price: 50000,
          gst_rate: 12,
          discount: 0,
          line_subtotal: 100000,
          hsn_sac: null,
        },
        {
          position: 3,
          name: "Item C",
          qty: 1,
          unit_price: 200000,
          gst_rate: 18,
          discount: 0,
          line_subtotal: 200000,
          hsn_sac: null,
        },
      ],
    });
    const result = mapInvoiceDetailRow(row);
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.detail.items[0].gstRate).toBe(5);
    expect(result.detail.items[1].gstRate).toBe(12);
    expect(result.detail.items[2].gstRate).toBe(18);
  });
});

// ─── Per-line discounts ───────────────────────────────────────────────────────

describe("mapInvoiceDetailRow — per-line discounts", () => {
  it("carries per-line discount through unchanged", () => {
    const row = makeRow({
      invoice_line_items: [
        {
          position: 1,
          name: "Item A",
          qty: 2,
          unit_price: 100000,
          gst_rate: 18,
          discount: 5000,
          line_subtotal: 195000,
          hsn_sac: null,
        },
      ],
      subtotal: 195000,
      tax_total: 35100,
      total: 230100,
    });
    const result = mapInvoiceDetailRow(row);
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.detail.items[0].discount).toBe(5000);
    expect(result.detail.subtotal).toBe(195000);
    expect(result.detail.taxTotal).toBe(35100);
    expect(result.detail.total).toBe(230100);
  });

  it("carries zero discount through unchanged", () => {
    const row = makeRow({
      invoice_line_items: [
        {
          position: 1,
          name: "Item A",
          qty: 1,
          unit_price: 100000,
          gst_rate: 18,
          discount: 0,
          line_subtotal: 100000,
          hsn_sac: null,
        },
      ],
    });
    const result = mapInvoiceDetailRow(row);
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.detail.items[0].discount).toBe(0);
  });
});

// ─── HSN/SAC ─────────────────────────────────────────────────────────────────

describe("mapInvoiceDetailRow — HSN/SAC", () => {
  it("carries hsn_sac string as hsnSac when present", () => {
    const row = makeRow({
      invoice_line_items: [
        {
          position: 1,
          name: "Item A",
          qty: 1,
          unit_price: 100000,
          gst_rate: 18,
          discount: 0,
          line_subtotal: 100000,
          hsn_sac: "998313",
        },
      ],
    });
    const result = mapInvoiceDetailRow(row);
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.detail.items[0].hsnSac).toBe("998313");
  });

  it("maps null hsn_sac to undefined hsnSac", () => {
    const row = makeRow({
      invoice_line_items: [
        {
          position: 1,
          name: "Item A",
          qty: 1,
          unit_price: 100000,
          gst_rate: 18,
          discount: 0,
          line_subtotal: 100000,
          hsn_sac: null,
        },
      ],
    });
    const result = mapInvoiceDetailRow(row);
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.detail.items[0].hsnSac).toBeUndefined();
  });
});

// ─── due date fallback ────────────────────────────────────────────────────────

describe("mapInvoiceDetailRow — due date fallback", () => {
  it("falls back to issue_date when due_date is null", () => {
    const result = mapInvoiceDetailRow(makeRow({ due_date: null, issue_date: "2026-05-01" }));
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.detail.dueIsoDate).toBe("2026-05-01");
  });
});

// ─── customers: null fallback ─────────────────────────────────────────────────

describe("mapInvoiceDetailRow — customers null", () => {
  it("uses empty string for name and city when customers is null", () => {
    const result = mapInvoiceDetailRow(makeRow({ customers: null }));
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.detail.customer).toBe("");
    expect(result.detail.city).toBe("");
  });
});

// ─── line items sorted by position ───────────────────────────────────────────

describe("mapInvoiceDetailRow — line items order", () => {
  it("sorts line items by position ascending", () => {
    const result = mapInvoiceDetailRow(
      makeRow({
        invoice_line_items: [
          {
            position: 3,
            name: "C",
            qty: 1,
            unit_price: 100,
            gst_rate: 5,
            discount: 0,
            line_subtotal: 100,
            hsn_sac: null,
          },
          {
            position: 1,
            name: "A",
            qty: 2,
            unit_price: 200,
            gst_rate: 5,
            discount: 0,
            line_subtotal: 400,
            hsn_sac: null,
          },
          {
            position: 2,
            name: "B",
            qty: 3,
            unit_price: 300,
            gst_rate: 5,
            discount: 0,
            line_subtotal: 900,
            hsn_sac: null,
          },
        ],
      }),
    );
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.detail.items.map((i) => i.name)).toEqual(["A", "B", "C"]);
  });
});
