/**
 * Pure CSV assembly helper for GST-ready invoice export.
 *
 * No Next.js or Supabase imports — this module is a pure transformation layer
 * and is trivially testable in isolation.
 *
 * Money columns: all values are stored as integer paise; this module converts
 * them to rupees with 2 decimal places (paise / 100, toFixed(2)).
 *
 * RFC-4180 escaping: a field is wrapped in double-quotes when it contains a
 * comma, double-quote, CR, or LF. Internal double-quotes are doubled ("").
 * Line endings use LF. The output is prefixed with a UTF-8 BOM (﻿) so
 * Excel auto-detects the encoding without a manual import wizard step.
 */

export const CSV_HEADER =
  "Invoice Number,Invoice Date,Status,Customer Name,Customer GSTIN,Vendor GSTIN,Place of Supply,Supply Type,HSN/SAC,Taxable Value,CGST,SGST,IGST,Total Tax,Invoice Total";

export interface ExportInvoiceRow {
  number: string | null;
  issue_date: string;
  status: string;
  customer_name: string | null;
  customer_gstin: string | null;
  vendor_gstin: string | null;
  place_of_supply: string | null;
  is_interstate: boolean;
  hsn_sac_values: string[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  tax_total: number;
  total: number;
}

function paiseToRupees(paise: number): string {
  return (paise / 100).toFixed(2);
}

/**
 * RFC-4180 field escaping.
 * Wraps in double-quotes when the value contains comma, double-quote, CR, or LF.
 * Internal double-quotes are doubled per RFC-4180 §2.7.
 */
function escapeField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildHsnField(values: string[]): string {
  const distinct = [...new Set(values.filter((v) => v.trim() !== ""))];
  return distinct.join("; ");
}

function buildRow(row: ExportInvoiceRow): string {
  const fields: string[] = [
    row.number ?? "",
    row.issue_date,
    row.status,
    row.customer_name ?? "",
    row.customer_gstin ?? "",
    row.vendor_gstin ?? "",
    row.place_of_supply ?? "",
    row.is_interstate ? "Interstate" : "Intrastate",
    buildHsnField(row.hsn_sac_values),
    paiseToRupees(row.subtotal),
    paiseToRupees(row.cgst),
    paiseToRupees(row.sgst),
    paiseToRupees(row.igst),
    paiseToRupees(row.tax_total),
    paiseToRupees(row.total),
  ];
  return fields.map(escapeField).join(",");
}

export function buildCsvBody(rows: ExportInvoiceRow[]): string {
  const lines = [CSV_HEADER, ...rows.map(buildRow)];
  // UTF-8 BOM prefix for Excel auto-detection, LF line endings throughout
  return "﻿" + lines.join("\n");
}
