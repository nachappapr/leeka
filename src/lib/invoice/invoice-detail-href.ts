import type { Invoice } from "@/lib/types/invoice";

/**
 * Detail-page link for an invoice row. Prefers the real Postgres UUID; falls
 * back to the display id (leading "#" stripped) only for synthetic/mock rows
 * with no UUID. A non-UUID param resolves to not-found on the detail page.
 */
export function invoiceDetailHref(invoice: Pick<Invoice, "id" | "invoiceUuid">): string {
  return `/invoices/${invoice.invoiceUuid ?? invoice.id.replace(/^#/, "")}`;
}
