import { StatusPill } from "@/components/ui/custom/status-pill";
import type { InvoiceDetail } from "@/lib/types";
import { formatInvoiceDate, formatPaise } from "@/lib/utils";
import { InvoicePreviewItemMobileRow } from "./invoice-preview-item-mobile-row";
import { InvoicePreviewItemRow } from "./invoice-preview-item-row";
import { InvoicePreviewMetaCell } from "./invoice-preview-meta-cell";

interface InvoicePreviewCardProps {
  invoice: InvoiceDetail;
  /** Hex accent colour from the business's invoice template. */
  accentColor?: string;
  /** Footer message from the business's invoice template. Empty string omits the line. */
  footerMessage?: string;
}

function formatDueRelative(dueIso: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueIso);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays > 0) return `In ${diffDays} days`;
  if (diffDays === -1) return "Yesterday";
  return `${Math.abs(diffDays)} days overdue`;
}

export function InvoicePreviewCard({
  invoice,
  accentColor = "#F46A39",
  footerMessage = "Thank you for your business!",
}: InvoicePreviewCardProps) {
  const { subtotal, taxTotal, total } = invoice;

  return (
    <article
      className="rounded-2xl bg-card p-8 shadow-card max-mobile:p-4.5"
      // eslint-disable-next-line no-restricted-syntax -- data-driven CSS var; accent colour set per business template
      style={{ ["--accent" as string]: accentColor }}
    >
      {/* Header: business identity (left) | invoice meta (right) — stacks on mobile */}
      <div className="flex items-start justify-between gap-4 max-mobile:flex-col">
        <div>
          <div className="flex size-14 items-center justify-center rounded-xl bg-(--accent) text-22 font-black text-white">
            RK
          </div>
          <h2 className="mt-3 text-title font-black text-ink">{invoice.issuerName}</h2>
          <address className="not-italic text-caption leading-relaxed text-ink-3">
            Sector 14, Gurugram, Haryana 122001
            <br />
            GSTIN 07AAACR1234A1Z5
          </address>
        </div>

        <div className="text-right max-mobile:text-left">
          <div className="text-kicker uppercase text-ink-3">Invoice</div>
          <div className="text-h2 font-black tracking-snug text-(--accent)">{invoice.id}</div>
          <div className="mt-1.5">
            <StatusPill status={invoice.status} />
          </div>
        </div>
      </div>

      <hr className="my-6 border-t border-border" />

      {/* Meta grid: 3-col desktop / 2-col mobile (Due spans full width on mobile) */}
      <div className="grid grid-cols-3 gap-5 max-mobile:grid-cols-2 max-mobile:gap-4">
        <InvoicePreviewMetaCell
          label="Billed to"
          primary={invoice.customer}
          secondary={invoice.city}
        />
        <InvoicePreviewMetaCell
          label="Issued"
          primary={formatInvoiceDate(invoice.isoDate)}
          secondary={invoice.issuerName ? `By ${invoice.issuerName}` : undefined}
          primaryDateTime={invoice.isoDate}
        />
        <InvoicePreviewMetaCell
          label="Due"
          primary={formatInvoiceDate(invoice.dueIsoDate)}
          secondary={formatDueRelative(invoice.dueIsoDate)}
          secondaryClassName="text-pending-ink"
          primaryDateTime={invoice.dueIsoDate}
          className="max-mobile:col-span-2"
        />
      </div>

      {/* Items table — desktop only */}
      <table className="mt-6 w-full max-mobile:hidden">
        <caption className="sr-only">Invoice line items</caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="rounded-tl-nav-item border-b border-border bg-background px-3.5 py-3 text-left text-kicker uppercase text-ink-3"
            >
              Item
            </th>
            <th
              scope="col"
              className="border-b border-border bg-background px-3.5 py-3 text-right text-kicker uppercase text-ink-3"
            >
              Qty
            </th>
            <th
              scope="col"
              className="border-b border-border bg-background px-3.5 py-3 text-right text-kicker uppercase text-ink-3"
            >
              Price
            </th>
            <th
              scope="col"
              className="rounded-tr-nav-item border-b border-border bg-background px-3.5 py-3 text-right text-kicker uppercase text-ink-3"
            >
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <InvoicePreviewItemRow key={item.name} item={item} />
          ))}
        </tbody>
      </table>

      {/* Items list — mobile only */}
      <div className="mt-6 min-mobile:hidden">
        <h3 className="mb-2.5 text-kicker uppercase text-ink-3">Items</h3>
        <ul className="flex flex-col">
          {invoice.items.map((item) => (
            <InvoicePreviewItemMobileRow key={item.name} item={item} />
          ))}
        </ul>
      </div>

      {/* Totals */}
      <div className="mt-6 min-mobile:flex min-mobile:justify-end">
        <div className="w-full min-mobile:max-w-65">
          <div className="flex items-center justify-between py-1 text-body-sm text-ink-2">
            <span>Subtotal</span>
            <span className="tabular">{formatPaise(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between py-1 text-body-sm text-ink-2">
            <span>Tax</span>
            <span className="tabular">{formatPaise(taxTotal)}</span>
          </div>
          <hr className="my-2 border-t border-border" />
          <div className="flex items-baseline justify-between">
            <span className="text-body-sm font-black text-ink">Total</span>
            <span className="tabular text-money-sm font-black text-ink">{formatPaise(total)}</span>
          </div>
        </div>
      </div>

      {footerMessage && (
        <p className="mt-7 rounded-nav-item bg-background px-4.5 py-3.5 text-center text-caption italic text-ink-2">
          {footerMessage}
        </p>
      )}
    </article>
  );
}
