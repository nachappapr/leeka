/**
 * AP-13 server-side totals computation.
 *
 * All values are integer paise (1 rupee = 100 paise). Rounding rule:
 * Math.round() — ties round to nearest even is NOT used; standard
 * arithmetic round (0.5 rounds up) is deterministic and matches what
 * AP-14 SQL counterpart will produce via ROUND(...).
 *
 * AP-14 extension point: this function currently computes a flat
 * tax_total = Σ line_tax with no CGST/SGST/IGST split. AP-14 will
 * extend ComputedTotals to carry cgst/sgst/igst and accept an
 * `isInterstate` flag + `gstEnabled` flag without rewriting the
 * per-line compute logic below.
 */

import type { DraftLineItem } from "@/lib/schema/invoice";

export interface ComputedLine {
  /** Gross line amount less per-line discount, in paise. */
  line_subtotal: number;
  /** Flat GST amount on line_subtotal at the line's gst_rate, in paise. */
  line_tax: number;
  /** line_subtotal + line_tax, in paise. */
  line_total: number;
}

export interface ComputedTotals {
  /** Σ line_subtotal across all lines, in paise. */
  subtotal: number;
  /**
   * AP-13: always 0 at the invoice level — per-line discounts are already
   * baked into line_subtotal. AP-14 may add an invoice-level discount here.
   */
  discount: number;
  /**
   * Σ line_tax across all lines (flat rate, no CGST/SGST/IGST split).
   * AP-14 extension: split into cgst/sgst (intra) or igst (inter).
   */
  tax_total: number;
  /** subtotal + tax_total (AP-13 does NOT add round_off; AP-14 will). */
  total: number;
  /** Per-line computed values, index-aligned with the input items array. */
  lines: ComputedLine[];
}

/**
 * Computes per-line and invoice-level totals from validated DraftLineItems.
 *
 * AP-13 math (all results are integer paise via Math.round):
 *   line_subtotal = round(qty * unit_price) - line.discount
 *   line_tax      = round(line_subtotal * gst_rate / 100)   [flat, no split]
 *   line_total    = line_subtotal + line_tax
 *   subtotal      = Σ line_subtotal
 *   tax_total     = Σ line_tax
 *   total         = subtotal + tax_total
 *
 * Negative line_subtotal (e.g. discount > gross) is clamped to 0 so that a
 * bad discount never produces negative tax.
 *
 * Pure: no I/O, no side effects, deterministic.
 */
export function computeTotals(items: DraftLineItem[]): ComputedTotals {
  const lines: ComputedLine[] = items.map((item) => {
    const gross = Math.round(item.qty * item.unit_price);
    const line_subtotal = Math.max(0, gross - item.discount);
    const line_tax = Math.round((line_subtotal * item.gst_rate) / 100);
    const line_total = line_subtotal + line_tax;
    return { line_subtotal, line_tax, line_total };
  });

  const subtotal = lines.reduce((s, l) => s + l.line_subtotal, 0);
  const tax_total = lines.reduce((s, l) => s + l.line_tax, 0);
  const total = subtotal + tax_total;

  return {
    subtotal,
    discount: 0, // AP-13: no invoice-level discount; AP-14 extension point
    tax_total,
    total,
    lines,
  };
}
