/**
 * AP-13 server-side totals computation, extended in AP-14 for GST split and round-off.
 *
 * All values are integer paise (1 rupee = 100 paise). Rounding rule:
 * Math.round() — standard arithmetic round (0.5 rounds up), deterministic,
 * matches AP-13's documented convention and the SQL ROUND() counterpart.
 *
 * AP-14 additions:
 *   - `options.gstEnabled` / `options.isInterstate` drive CGST/SGST vs IGST split.
 *   - `round_off` brings the invoice total to the nearest whole rupee.
 *   - ComputedLine carries per-line cgst/sgst/igst.
 *   - ComputedTotals carries invoice-level cgst/sgst/igst/round_off.
 */

import type { DraftLineItem } from "@/lib/schema/invoice";

export interface ComputedLine {
  /** Gross line amount less per-line discount, in paise. */
  line_subtotal: number;
  /** Flat GST amount on line_subtotal at the line's gst_rate, in paise. */
  line_tax: number;
  /** line_subtotal + line_tax, in paise. */
  line_total: number;
  /** Intra-state: floor(line_tax / 2). Inter-state or GST off: 0. */
  cgst: number;
  /** Intra-state: line_tax − cgst (absorbs the odd paise so cgst+sgst === line_tax). Inter-state or GST off: 0. */
  sgst: number;
  /** Inter-state: line_tax. Intra-state or GST off: 0. */
  igst: number;
}

export interface ComputedTotals {
  /** Σ line_subtotal across all lines, in paise. */
  subtotal: number;
  /**
   * Always 0 at the invoice level — per-line discounts are already baked into
   * line_subtotal. AP-14 does not add invoice-level discount (out of scope).
   */
  discount: number;
  /** Σ line_tax across all lines (= cgst + sgst + igst), in paise. */
  tax_total: number;
  /** Σ line cgst across all lines, in paise. 0 when gstEnabled=false or isInterstate=true. */
  cgst: number;
  /** Σ line sgst across all lines, in paise. 0 when gstEnabled=false or isInterstate=true. */
  sgst: number;
  /** Σ line igst across all lines, in paise. 0 when gstEnabled=false or isInterstate=false. */
  igst: number;
  /**
   * Adjustment to bring total to the nearest whole rupee (multiple of 100 paise).
   * round_off = round(rawTotal / 100) * 100 − rawTotal. May be negative.
   */
  round_off: number;
  /**
   * rawTotal + round_off: always a multiple of 100 paise.
   * rawTotal = subtotal + tax_total.
   */
  total: number;
  /** Per-line computed values, index-aligned with the input items array. */
  lines: ComputedLine[];
}

export interface ComputeTotalsOptions {
  /**
   * Whether IGST applies (different state codes for supplier and recipient).
   * true  → igst = line_tax, cgst = sgst = 0.
   * false → cgst = floor(line_tax/2), sgst = line_tax − cgst, igst = 0.
   * Ignored when gstEnabled=false.
   */
  isInterstate: boolean;
  /**
   * Whether the business has GST enabled on this invoice.
   * false → line_tax = 0, all tax splits = 0 regardless of gst_rate.
   */
  gstEnabled: boolean;
}

/**
 * Computes per-line and invoice-level totals from validated DraftLineItems.
 *
 * Per-line math (integer paise via Math.round):
 *   line_subtotal = max(0, round(qty × unit_price) − discount)
 *   line_tax      = gstEnabled ? round(line_subtotal × gst_rate / 100) : 0
 *   line_total    = line_subtotal + line_tax
 *
 * Tax split when gstEnabled=true:
 *   intra-state: cgst = floor(line_tax/2), sgst = line_tax − cgst (no lost paise on odd amounts)
 *   inter-state: igst = line_tax, cgst = sgst = 0
 *
 * Round-off (AP-14):
 *   rawTotal  = subtotal + tax_total
 *   round_off = round(rawTotal / 100) × 100 − rawTotal
 *   total     = rawTotal + round_off  (nearest whole rupee, multiple of 100 paise)
 *
 * Pure: no I/O, no side effects, deterministic.
 */
export function computeTotals(
  items: DraftLineItem[],
  options: ComputeTotalsOptions = { isInterstate: false, gstEnabled: false },
): ComputedTotals {
  const { isInterstate, gstEnabled } = options;

  const lines: ComputedLine[] = items.map((item) => {
    const gross = Math.round(item.qty * item.unit_price);
    const line_subtotal = Math.max(0, gross - item.discount);
    const line_tax = gstEnabled ? Math.round((line_subtotal * item.gst_rate) / 100) : 0;
    const line_total = line_subtotal + line_tax;

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (gstEnabled && line_tax > 0) {
      if (isInterstate) {
        igst = line_tax;
      } else {
        // floor(line_tax/2) so cgst+sgst === line_tax exactly — odd paise always goes to sgst.
        cgst = Math.floor(line_tax / 2);
        sgst = line_tax - cgst;
      }
    }

    return { line_subtotal, line_tax, line_total, cgst, sgst, igst };
  });

  const subtotal = lines.reduce((s, l) => s + l.line_subtotal, 0);
  const tax_total = lines.reduce((s, l) => s + l.line_tax, 0);
  const cgst = lines.reduce((s, l) => s + l.cgst, 0);
  const sgst = lines.reduce((s, l) => s + l.sgst, 0);
  const igst = lines.reduce((s, l) => s + l.igst, 0);

  const rawTotal = subtotal + tax_total;
  // round_off brings rawTotal to the nearest whole rupee; may be negative.
  const round_off = Math.round(rawTotal / 100) * 100 - rawTotal;
  const total = rawTotal + round_off;

  return {
    subtotal,
    discount: 0,
    tax_total,
    cgst,
    sgst,
    igst,
    round_off,
    total,
    lines,
  };
}
