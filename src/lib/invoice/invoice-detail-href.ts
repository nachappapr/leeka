import type { Invoice } from "@/lib/types/invoice";

/**
 * Detail-page link for an invoice row. Prefers the real Postgres UUID; falls
 * back to the display id (leading "#" stripped) only for synthetic/mock rows
 * with no UUID. A non-UUID param resolves to not-found on the detail page.
 */
export function invoiceDetailHref(invoice: Pick<Invoice, "id" | "invoiceUuid">): string {
  return `/invoices/${invoice.invoiceUuid ?? invoice.id.replace(/^#/, "")}`;
}

export function invoiceEditHref(invoice: Pick<Invoice, "id" | "invoiceUuid">): string {
  return `/invoices/${invoice.invoiceUuid ?? invoice.id.replace(/^#/, "")}/edit`;
}

/**
 * Row-click destination for an invoice. Drafts have no read-only detail view,
 * so they open straight in the editor; everything else opens the detail page.
 * Lets list/search surfaces link directly instead of bouncing through the
 * detail page's draft→edit redirect (which stays as a safety net for direct
 * URL hits and recents that don't carry a status).
 */
export function invoiceRowHref(
  invoice: Pick<Invoice, "id" | "invoiceUuid"> & { status: string },
): string {
  return invoice.status === "draft" ? invoiceEditHref(invoice) : invoiceDetailHref(invoice);
}
