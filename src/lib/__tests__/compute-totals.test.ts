import { describe, it, expect } from "vitest";
import { computeTotals } from "@/lib/invoice/compute-totals";
import type { DraftLineItem } from "@/lib/schema/invoice";

const line = (
  overrides: Partial<DraftLineItem> & Pick<DraftLineItem, "name" | "qty" | "unit_price">,
): DraftLineItem => ({
  name: overrides.name,
  qty: overrides.qty,
  unit_price: overrides.unit_price,
  discount: overrides.discount ?? 0,
  gst_rate: overrides.gst_rate ?? 0,
  hsn_sac: overrides.hsn_sac,
});

describe("computeTotals", () => {
  it("computes a single line correctly", () => {
    const result = computeTotals([
      line({ name: "Item A", qty: 1, unit_price: 10000, gst_rate: 18 }),
    ]);

    // gross = 1 * 10000 = 10000; line_subtotal = 10000; line_tax = round(10000*18/100) = 1800
    expect(result.subtotal).toBe(10000);
    expect(result.tax_total).toBe(1800);
    expect(result.total).toBe(11800);
    expect(result.discount).toBe(0);
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0].line_subtotal).toBe(10000);
    expect(result.lines[0].line_tax).toBe(1800);
    expect(result.lines[0].line_total).toBe(11800);
  });

  it("sums correctly across multiple lines", () => {
    const items = [
      line({ name: "Item A", qty: 2, unit_price: 5000, gst_rate: 18 }),
      line({ name: "Item B", qty: 3, unit_price: 2000, gst_rate: 5 }),
    ];
    const result = computeTotals(items);

    // Line A: gross=10000, subtotal=10000, tax=round(10000*18/100)=1800, total=11800
    // Line B: gross=6000,  subtotal=6000,  tax=round(6000*5/100)=300,   total=6300
    expect(result.subtotal).toBe(16000);
    expect(result.tax_total).toBe(2100);
    expect(result.total).toBe(18100);
  });

  it("rounds half-up on a 0.5 paise boundary", () => {
    // line_subtotal=1 paise, gst_rate=50% → 1*50/100 = 0.5 → Math.round(0.5) = 1
    const result = computeTotals([line({ name: "Edge", qty: 1, unit_price: 1, gst_rate: 50 })]);
    expect(result.lines[0].line_tax).toBe(1);
    expect(Number.isInteger(result.lines[0].line_tax)).toBe(true);
  });

  it("clamps line_subtotal to 0 when discount exceeds gross", () => {
    // gross = 1*10000 = 10000; discount=20000 > gross → clamped to 0
    const result = computeTotals([
      line({ name: "Disc", qty: 1, unit_price: 10000, discount: 20000, gst_rate: 18 }),
    ]);
    expect(result.lines[0].line_subtotal).toBe(0);
    expect(result.lines[0].line_tax).toBe(0);
    expect(result.lines[0].line_total).toBe(0);
    expect(result.subtotal).toBe(0);
    expect(result.tax_total).toBe(0);
  });

  it("uses discount=0 by default", () => {
    const withDefault = computeTotals([
      line({ name: "X", qty: 1, unit_price: 5000, gst_rate: 10 }),
    ]);
    const withExplicit = computeTotals([
      line({ name: "X", qty: 1, unit_price: 5000, discount: 0, gst_rate: 10 }),
    ]);
    expect(withDefault.total).toBe(withExplicit.total);
  });

  it("always sets invoice-level discount to 0", () => {
    const result = computeTotals([line({ name: "X", qty: 1, unit_price: 10000, gst_rate: 0 })]);
    expect(result.discount).toBe(0);
  });

  it("produces integer paise for all output values", () => {
    const result = computeTotals([
      line({ name: "A", qty: 3, unit_price: 333, gst_rate: 18 }),
      line({ name: "B", qty: 7, unit_price: 100, gst_rate: 5 }),
    ]);
    expect(Number.isInteger(result.subtotal)).toBe(true);
    expect(Number.isInteger(result.tax_total)).toBe(true);
    expect(Number.isInteger(result.total)).toBe(true);
    for (const l of result.lines) {
      expect(Number.isInteger(l.line_subtotal)).toBe(true);
      expect(Number.isInteger(l.line_tax)).toBe(true);
      expect(Number.isInteger(l.line_total)).toBe(true);
    }
  });
});
