import { formatInvoiceDate, formatRupees } from "@/lib/utils";

// Paise ↔ rupee boundary: items carry paise values; display divides by 100.
function paiseToRupees(paise: number): number {
  return paise / 100;
}

export interface InvoiceFormLivePreviewItem {
  name: string;
  qty: number;
  unit_price: number;
  discount: number;
}

interface InvoiceFormLivePreviewProps {
  invoiceIdNoHash: string;
  customerName: string;
  phone: string;
  items: ReadonlyArray<InvoiceFormLivePreviewItem>;
  subtotal: number;
  taxTotal: number;
  total: number;
  isoDate: string;
  dueIsoDate: string;
}

export function InvoiceFormLivePreview({
  invoiceIdNoHash,
  customerName,
  phone,
  items,
  subtotal,
  taxTotal,
  total,
  isoDate,
  dueIsoDate,
}: InvoiceFormLivePreviewProps) {
  const visibleItems = items.filter((it) => it.name.trim().length > 0);

  return (
    <section
      aria-label="Invoice preview"
      className="rounded-lg border border-border bg-card p-7 text-caption shadow-card"
    >
      {/* Header row */}
      <div className="flex items-start justify-between">
        {/* Vendor identity */}
        <div>
          {/* text-ink on bg-coral = 5.73:1 ✓ WCAG AA */}
          <div className="flex size-11 items-center justify-center rounded-md bg-coral text-body font-extrabold text-ink">
            RK
          </div>
          <p className="mt-2 text-body font-extrabold text-ink">Raj Kumar Trading</p>
          <p className="text-11 text-ink-3">GSTIN 07AAACR1234A1Z5</p>
        </div>
        {/* Invoice meta */}
        <div className="text-right">
          <p className="text-10 font-extrabold uppercase tracking-wider text-ink-3">Invoice</p>
          {/* text-coral-ink on bg-card = 12.93:1 ✓ WCAG AA */}
          <p className="text-title-sm font-extrabold text-coral-ink">{invoiceIdNoHash}</p>
          <time dateTime={isoDate} className="mt-1.5 block text-11 text-ink-3">
            {formatInvoiceDate(isoDate)}
          </time>
        </div>
      </div>

      <hr className="my-4 border-t border-border" />

      {/* Billed-to / Due — dl semantics for label/value pairs */}
      <dl className="grid grid-cols-2 gap-3">
        <div>
          <dt className="text-10 font-extrabold uppercase tracking-wider text-ink-3">Billed to</dt>
          <dd className="mt-1 text-12 font-bold text-ink">{customerName}</dd>
          <dd className="text-11 text-ink-3">{phone}</dd>
        </div>
        <div>
          <dt className="text-10 font-extrabold uppercase tracking-wider text-ink-3">Due</dt>
          <dd className="mt-1 text-12 font-bold text-ink">
            <time dateTime={dueIsoDate}>{formatInvoiceDate(dueIsoDate)}</time>
          </dd>
        </div>
      </dl>

      {/* Items list — table semantics for screen-reader row/col navigation */}
      <div className="mt-4 rounded-sm bg-background px-3 py-2.5">
        <table className="w-full text-11">
          <caption className="sr-only">Invoice line items</caption>
          <thead className="sr-only">
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Amount</th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((it, i) => {
              const gross = Math.round(it.qty * it.unit_price);
              const lineSubtotal = Math.max(0, gross - it.discount);
              return (
                <tr
                  key={`${it.name}-${i}`}
                  className="border-b border-dashed border-border last:border-b-0"
                >
                  <td className="py-1.5">
                    <p className="font-semibold text-ink">{it.name}</p>
                    <p className="text-ink-3">
                      {it.qty} × {formatRupees(paiseToRupees(it.unit_price))}
                    </p>
                  </td>
                  <td className="py-1.5 text-right tabular font-bold">
                    {formatRupees(paiseToRupees(lineSubtotal))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals — dl semantics for label/value pairs */}
      <dl className="mt-3">
        <div className="flex justify-between py-0.5 text-11 text-ink-2">
          <dt>Subtotal</dt>
          <dd className="tabular">{formatRupees(paiseToRupees(subtotal))}</dd>
        </div>
        <div className="flex justify-between py-0.5 text-11 text-ink-2">
          <dt>GST</dt>
          <dd className="tabular">{formatRupees(paiseToRupees(taxTotal))}</dd>
        </div>
        {/* text-ink on bg-coral = 5.73:1 ✓ WCAG AA */}
        <div className="mt-2 flex items-baseline justify-between rounded-sm bg-coral px-3 py-2.5 text-ink">
          <dt className="text-11 font-extrabold uppercase tracking-wider">TOTAL DUE</dt>
          <dd className="tabular text-20 font-extrabold">{formatRupees(paiseToRupees(total))}</dd>
        </div>
      </dl>

      {/* Footer line */}
      <p className="mt-3.5 text-center text-11 italic text-ink-3">Thank you for your business!</p>
    </section>
  );
}
