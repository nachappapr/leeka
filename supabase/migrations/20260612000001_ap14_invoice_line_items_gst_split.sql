-- AP-14: Add per-line GST split columns to invoice_line_items
-- cgst/sgst/igst mirror the invoices table convention: integer paise, NOT NULL, default 0.
-- round_off is invoice-level only — not added here.

alter table public.invoice_line_items
  add column cgst integer not null default 0,
  add column sgst integer not null default 0,
  add column igst integer not null default 0;
