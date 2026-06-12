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

// ─── AP-13 baseline tests (migrated to new signature, gstEnabled=false default) ────

describe("computeTotals — AP-13 baseline (gstEnabled=false default)", () => {
  it("computes a single line correctly", () => {
    const result = computeTotals(
      [line({ name: "Item A", qty: 1, unit_price: 10000, gst_rate: 18 })],
      { gstEnabled: false, isInterstate: false },
    );

    // gross = 1 * 10000 = 10000; line_subtotal = 10000; gstEnabled=false so line_tax = 0
    expect(result.subtotal).toBe(10000);
    expect(result.tax_total).toBe(0);
    expect(result.lines[0].line_tax).toBe(0);
    expect(result.discount).toBe(0);
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0].line_subtotal).toBe(10000);
    expect(result.lines[0].line_total).toBe(10000);
  });

  it("sums correctly across multiple lines (no GST)", () => {
    const items = [
      line({ name: "Item A", qty: 2, unit_price: 5000, gst_rate: 18 }),
      line({ name: "Item B", qty: 3, unit_price: 2000, gst_rate: 5 }),
    ];
    const result = computeTotals(items, { gstEnabled: false, isInterstate: false });

    // Line A: gross=10000, subtotal=10000, tax=0 (gstEnabled=false)
    // Line B: gross=6000,  subtotal=6000,  tax=0
    expect(result.subtotal).toBe(16000);
    expect(result.tax_total).toBe(0);
  });

  it("rounds half-up on a 0.5 paise boundary (gross calc)", () => {
    // qty=1, unit_price=1 → gross=1; with gst_rate=50 but gstEnabled=false → tax=0
    const result = computeTotals([line({ name: "Edge", qty: 1, unit_price: 1, gst_rate: 50 })], {
      gstEnabled: false,
      isInterstate: false,
    });
    expect(result.lines[0].line_tax).toBe(0);
    expect(Number.isInteger(result.lines[0].line_tax)).toBe(true);
  });

  it("clamps line_subtotal to 0 when discount exceeds gross", () => {
    // gross = 1*10000 = 10000; discount=20000 > gross → clamped to 0
    const result = computeTotals(
      [line({ name: "Disc", qty: 1, unit_price: 10000, discount: 20000, gst_rate: 18 })],
      { gstEnabled: false, isInterstate: false },
    );
    expect(result.lines[0].line_subtotal).toBe(0);
    expect(result.lines[0].line_tax).toBe(0);
    expect(result.lines[0].line_total).toBe(0);
    expect(result.subtotal).toBe(0);
    expect(result.tax_total).toBe(0);
  });

  it("uses discount=0 by default", () => {
    const withDefault = computeTotals(
      [line({ name: "X", qty: 1, unit_price: 5000, gst_rate: 10 })],
      { gstEnabled: false, isInterstate: false },
    );
    const withExplicit = computeTotals(
      [line({ name: "X", qty: 1, unit_price: 5000, discount: 0, gst_rate: 10 })],
      { gstEnabled: false, isInterstate: false },
    );
    expect(withDefault.total).toBe(withExplicit.total);
  });

  it("always sets invoice-level discount to 0", () => {
    const result = computeTotals([line({ name: "X", qty: 1, unit_price: 10000, gst_rate: 0 })], {
      gstEnabled: false,
      isInterstate: false,
    });
    expect(result.discount).toBe(0);
  });

  it("produces integer paise for all output values", () => {
    const result = computeTotals(
      [
        line({ name: "A", qty: 3, unit_price: 333, gst_rate: 18 }),
        line({ name: "B", qty: 7, unit_price: 100, gst_rate: 5 }),
      ],
      { gstEnabled: false, isInterstate: false },
    );
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

// ─── AP-14 GST split tests ────────────────────────────────────────────────────

describe("computeTotals — AP-14 GST disabled", () => {
  it("zeroes all tax fields when gstEnabled=false, regardless of gst_rate", () => {
    const result = computeTotals(
      [line({ name: "Item", qty: 1, unit_price: 10000, gst_rate: 18 })],
      { gstEnabled: false, isInterstate: false },
    );
    expect(result.tax_total).toBe(0);
    expect(result.cgst).toBe(0);
    expect(result.sgst).toBe(0);
    expect(result.igst).toBe(0);
    expect(result.lines[0].cgst).toBe(0);
    expect(result.lines[0].sgst).toBe(0);
    expect(result.lines[0].igst).toBe(0);
  });

  it("zeroes tax for interstate=true with gstEnabled=false", () => {
    const result = computeTotals(
      [line({ name: "Item", qty: 1, unit_price: 10000, gst_rate: 28 })],
      { gstEnabled: false, isInterstate: true },
    );
    expect(result.cgst).toBe(0);
    expect(result.sgst).toBe(0);
    expect(result.igst).toBe(0);
    expect(result.tax_total).toBe(0);
  });
});

describe("computeTotals — AP-14 intra-state (CGST+SGST)", () => {
  it("splits tax into CGST+SGST for a single line at 18%", () => {
    // line_subtotal=10000, gst_rate=18 → line_tax=1800; cgst=900, sgst=900
    const result = computeTotals(
      [line({ name: "Item A", qty: 1, unit_price: 10000, gst_rate: 18 })],
      { gstEnabled: true, isInterstate: false },
    );
    expect(result.lines[0].line_tax).toBe(1800);
    expect(result.lines[0].cgst).toBe(900);
    expect(result.lines[0].sgst).toBe(900);
    expect(result.lines[0].igst).toBe(0);
    expect(result.cgst).toBe(900);
    expect(result.sgst).toBe(900);
    expect(result.igst).toBe(0);
    expect(result.tax_total).toBe(1800);
    expect(result.cgst + result.sgst).toBe(result.tax_total);
  });

  it("handles odd-paise half-split (cgst=floor, sgst absorbs the odd paise)", () => {
    // line_subtotal=1 paise, gst_rate=50% → line_tax=round(0.5)=1; cgst=floor(1/2)=0, sgst=1-0=1
    const result = computeTotals([line({ name: "Odd", qty: 1, unit_price: 1, gst_rate: 50 })], {
      gstEnabled: true,
      isInterstate: false,
    });
    expect(result.lines[0].line_tax).toBe(1);
    expect(result.lines[0].cgst).toBe(0);
    expect(result.lines[0].sgst).toBe(1);
    expect(result.lines[0].cgst + result.lines[0].sgst).toBe(result.lines[0].line_tax);
    expect(Number.isInteger(result.lines[0].cgst)).toBe(true);
    expect(Number.isInteger(result.lines[0].sgst)).toBe(true);
  });

  it("odd-paise half-split: another case — line_tax=3 → cgst=1, sgst=2", () => {
    // We need line_tax=3. At gst_rate=5: need line_subtotal=60 paise
    // qty=60, unit_price=1 → gross=60; tax=round(60*5/100)=round(3)=3
    const result = computeTotals([line({ name: "Odd3", qty: 60, unit_price: 1, gst_rate: 5 })], {
      gstEnabled: true,
      isInterstate: false,
    });
    expect(result.lines[0].line_tax).toBe(3);
    expect(result.lines[0].cgst).toBe(1);
    expect(result.lines[0].sgst).toBe(2);
    expect(result.lines[0].cgst + result.lines[0].sgst).toBe(3);
  });

  it("sums CGST/SGST across multi-line intra-state invoice", () => {
    // Line A: subtotal=10000, tax=1800 (18%) → cgst=900, sgst=900
    // Line B: subtotal=6000,  tax=300  (5%)  → cgst=150, sgst=150
    const result = computeTotals(
      [
        line({ name: "A", qty: 2, unit_price: 5000, gst_rate: 18 }),
        line({ name: "B", qty: 3, unit_price: 2000, gst_rate: 5 }),
      ],
      { gstEnabled: true, isInterstate: false },
    );
    expect(result.cgst).toBe(1050);
    expect(result.sgst).toBe(1050);
    expect(result.igst).toBe(0);
    expect(result.tax_total).toBe(2100);
    expect(result.cgst + result.sgst).toBe(result.tax_total);
  });

  it("mixed-rate multi-line: integer paise for all splits", () => {
    const result = computeTotals(
      [
        line({ name: "A", qty: 3, unit_price: 333, gst_rate: 18 }),
        line({ name: "B", qty: 7, unit_price: 100, gst_rate: 5 }),
        line({ name: "C", qty: 1, unit_price: 50000, gst_rate: 28 }),
      ],
      { gstEnabled: true, isInterstate: false },
    );
    for (const l of result.lines) {
      expect(Number.isInteger(l.cgst)).toBe(true);
      expect(Number.isInteger(l.sgst)).toBe(true);
      expect(Number.isInteger(l.igst)).toBe(true);
      expect(l.cgst + l.sgst).toBe(l.line_tax);
    }
    expect(Number.isInteger(result.cgst)).toBe(true);
    expect(Number.isInteger(result.sgst)).toBe(true);
    expect(result.cgst + result.sgst + result.igst).toBe(result.tax_total);
  });
});

describe("computeTotals — AP-14 inter-state (IGST)", () => {
  it("puts all tax into IGST, zeroes CGST and SGST", () => {
    // line_subtotal=10000, gst_rate=18 → line_tax=1800; igst=1800
    const result = computeTotals(
      [line({ name: "Item A", qty: 1, unit_price: 10000, gst_rate: 18 })],
      { gstEnabled: true, isInterstate: true },
    );
    expect(result.lines[0].igst).toBe(1800);
    expect(result.lines[0].cgst).toBe(0);
    expect(result.lines[0].sgst).toBe(0);
    expect(result.igst).toBe(1800);
    expect(result.cgst).toBe(0);
    expect(result.sgst).toBe(0);
    expect(result.tax_total).toBe(1800);
  });

  it("sums IGST across multi-line inter-state invoice", () => {
    const result = computeTotals(
      [
        line({ name: "A", qty: 2, unit_price: 5000, gst_rate: 18 }),
        line({ name: "B", qty: 3, unit_price: 2000, gst_rate: 5 }),
      ],
      { gstEnabled: true, isInterstate: true },
    );
    expect(result.igst).toBe(2100);
    expect(result.cgst).toBe(0);
    expect(result.sgst).toBe(0);
    expect(result.tax_total).toBe(2100);
  });

  it("integer paise for all IGST splits", () => {
    const result = computeTotals(
      [
        line({ name: "A", qty: 3, unit_price: 333, gst_rate: 18 }),
        line({ name: "B", qty: 7, unit_price: 100, gst_rate: 5 }),
      ],
      { gstEnabled: true, isInterstate: true },
    );
    for (const l of result.lines) {
      expect(Number.isInteger(l.igst)).toBe(true);
      expect(l.igst).toBe(l.line_tax);
      expect(l.cgst).toBe(0);
      expect(l.sgst).toBe(0);
    }
  });
});

describe("computeTotals — AP-14 round-off", () => {
  it("rounds to nearest whole rupee (positive round_off)", () => {
    // subtotal=10000, tax=1800 (18%, intra) → rawTotal=11800
    // round(11800/100)*100 = 11800 → round_off=0, total=11800
    const result = computeTotals(
      [line({ name: "Item", qty: 1, unit_price: 10000, gst_rate: 18 })],
      { gstEnabled: true, isInterstate: false },
    );
    expect(result.round_off).toBe(0);
    expect(result.total).toBe(11800);
    expect(result.total % 100).toBe(0);
  });

  it("produces negative round_off when rawTotal paise > 50", () => {
    // We need rawTotal to have paise remainder > 50 so round_off is negative.
    // qty=1, unit_price=10060, gst_rate=18 → gross=10060; tax=round(10060*18/100)=round(1810.8)=1811
    // rawTotal=10060+1811=11871; round(11871/100)*100=11900; round_off=11900-11871=29
    const result = computeTotals(
      [line({ name: "Item", qty: 1, unit_price: 10060, gst_rate: 18 })],
      { gstEnabled: true, isInterstate: false },
    );
    expect(result.round_off).toBe(29);
    expect(result.total).toBe(11900);
    expect(result.total % 100).toBe(0);
  });

  it("produces negative round_off when rawTotal paise < 50", () => {
    // qty=1, unit_price=10030, gst_rate=18 → gross=10030; tax=round(10030*18/100)=round(1805.4)=1805
    // rawTotal=10030+1805=11835; round(11835/100)*100=11800; round_off=11800-11835=-35
    const result = computeTotals(
      [line({ name: "Item", qty: 1, unit_price: 10030, gst_rate: 18 })],
      { gstEnabled: true, isInterstate: false },
    );
    expect(result.round_off).toBe(-35);
    expect(result.total).toBe(11800);
    expect(result.total % 100).toBe(0);
  });

  it("total is always a multiple of 100 paise", () => {
    const cases = [
      line({ name: "A", qty: 3, unit_price: 333, gst_rate: 18 }),
      line({ name: "B", qty: 7, unit_price: 101, gst_rate: 5 }),
      line({ name: "C", qty: 2, unit_price: 9999, gst_rate: 12 }),
    ];
    const result = computeTotals(cases, { gstEnabled: true, isInterstate: false });
    expect(result.total % 100).toBe(0);
    expect(Number.isInteger(result.round_off)).toBe(true);
    expect(result.total).toBe(result.subtotal + result.tax_total + result.round_off);
  });

  it("round_off=0 when rawTotal is already an exact multiple of 100", () => {
    // subtotal=10000, tax=0 (gstEnabled=false) → rawTotal=10000; round_off=0
    const result = computeTotals([line({ name: "Item", qty: 1, unit_price: 10000 })], {
      gstEnabled: false,
      isInterstate: false,
    });
    expect(result.round_off).toBe(0);
    expect(result.total).toBe(10000);
  });

  it("tax_total === cgst + sgst + igst", () => {
    const result = computeTotals(
      [
        line({ name: "A", qty: 2, unit_price: 5000, gst_rate: 18 }),
        line({ name: "B", qty: 3, unit_price: 2000, gst_rate: 5 }),
      ],
      { gstEnabled: true, isInterstate: false },
    );
    expect(result.tax_total).toBe(result.cgst + result.sgst + result.igst);
  });

  it("total = rawTotal + round_off (structural invariant)", () => {
    const result = computeTotals(
      [line({ name: "Item", qty: 1, unit_price: 10030, gst_rate: 18 })],
      { gstEnabled: true, isInterstate: true },
    );
    const rawTotal = result.subtotal + result.tax_total;
    expect(result.total).toBe(rawTotal + result.round_off);
  });
});

describe("computeTotals — default options backward compatibility", () => {
  it("calling without options defaults to gstEnabled=false, isInterstate=false", () => {
    const withOptions = computeTotals(
      [line({ name: "X", qty: 1, unit_price: 10000, gst_rate: 18 })],
      { gstEnabled: false, isInterstate: false },
    );
    const withDefaults = computeTotals([
      line({ name: "X", qty: 1, unit_price: 10000, gst_rate: 18 }),
    ]);
    expect(withDefaults.subtotal).toBe(withOptions.subtotal);
    expect(withDefaults.tax_total).toBe(withOptions.tax_total);
    expect(withDefaults.total).toBe(withOptions.total);
    expect(withDefaults.cgst).toBe(0);
    expect(withDefaults.sgst).toBe(0);
    expect(withDefaults.igst).toBe(0);
  });
});
