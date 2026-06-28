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
    businesses: { name: "Raj Kumar Trading" },
    customers: { name: "Mehta Store", city: "Mumbai" },
    invoice_line_items: [{ position: 1, name: "Widget A", qty: 5, unit_price: 100000 }],
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

  it("maps line items with name, qty, unitPrice in paise", () => {
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.detail.items).toEqual([{ name: "Widget A", qty: 5, unitPrice: 100000 }]);
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
          { position: 3, name: "C", qty: 1, unit_price: 100 },
          { position: 1, name: "A", qty: 2, unit_price: 200 },
          { position: 2, name: "B", qty: 3, unit_price: 300 },
        ],
      }),
    );
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.detail.items.map((i) => i.name)).toEqual(["A", "B", "C"]);
  });
});
