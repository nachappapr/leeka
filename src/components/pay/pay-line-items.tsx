import { formatPaise } from "@/lib/utils";
import { PayCard } from "./pay-card";
import type { PublicLineItem } from "./pay-container";

interface PayLineItemsProps {
  lineItems: PublicLineItem[];
  gstEnabled: boolean;
}

export function PayLineItems({ lineItems, gstEnabled }: PayLineItemsProps) {
  if (lineItems.length === 0) return null;

  return (
    <PayCard as="section" aria-label="Line items">
      <table className="w-full max-mobile:hidden">
        <caption className="sr-only">Invoice line items</caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="border-b border-border bg-background px-5 py-3 text-left text-kicker uppercase text-ink-3"
            >
              Item
            </th>
            {gstEnabled ? (
              <th
                scope="col"
                className="border-b border-border bg-background px-3 py-3 text-right text-kicker uppercase text-ink-3"
              >
                HSN/SAC
              </th>
            ) : null}
            <th
              scope="col"
              className="border-b border-border bg-background px-3 py-3 text-right text-kicker uppercase text-ink-3"
            >
              Qty
            </th>
            <th
              scope="col"
              className="border-b border-border bg-background px-3 py-3 text-right text-kicker uppercase text-ink-3"
            >
              Rate
            </th>
            {gstEnabled ? (
              <th
                scope="col"
                className="border-b border-border bg-background px-3 py-3 text-right text-kicker uppercase text-ink-3"
              >
                GST
              </th>
            ) : null}
            <th
              scope="col"
              className="border-b border-border bg-background px-5 py-3 text-right text-kicker uppercase text-ink-3"
            >
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item) => (
            <tr key={item.position}>
              <td className="border-b border-border px-5 py-3.5 text-body-sm font-medium text-ink">
                {item.name}
              </td>
              {gstEnabled ? (
                <td className="border-b border-border px-3 py-3.5 text-right text-body-sm text-ink-3">
                  {item.hsn_sac ?? "—"}
                </td>
              ) : null}
              <td className="tabular border-b border-border px-3 py-3.5 text-right text-body-sm font-bold text-ink-2">
                {item.qty}
              </td>
              <td className="tabular border-b border-border px-3 py-3.5 text-right text-body-sm text-ink-2">
                {formatPaise(item.unit_price)}
              </td>
              {gstEnabled ? (
                <td className="border-b border-border px-3 py-3.5 text-right text-body-sm text-ink-3">
                  {item.gst_rate != null ? `${item.gst_rate}%` : "—"}
                </td>
              ) : null}
              <td className="tabular border-b border-border px-5 py-3.5 text-right text-body-sm font-semibold text-ink">
                {formatPaise(item.line_total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-border min-mobile:hidden" aria-label="Line items">
        {lineItems.map((item) => (
          <li key={item.position} className="px-4 py-3.5">
            <div className="flex items-start justify-between gap-2">
              <span className="text-body-sm font-medium text-ink">{item.name}</span>
              <span className="tabular shrink-0 text-body-sm font-semibold text-ink">
                {formatPaise(item.line_total)}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
              <span className="text-caption text-ink-3">
                {item.qty} × {formatPaise(item.unit_price)}
              </span>
              {gstEnabled && item.hsn_sac ? (
                <span className="text-caption text-ink-3">HSN {item.hsn_sac}</span>
              ) : null}
              {gstEnabled && item.gst_rate != null ? (
                <span className="text-caption text-ink-3">GST {item.gst_rate}%</span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </PayCard>
  );
}
