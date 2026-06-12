import { cn } from "@/lib/utils/cn";
import { formatPaise } from "@/lib/utils";
import { PayCard } from "./pay-card";

interface PayTotalsProps {
  subtotal: number;
  discount: number;
  cgst: number;
  sgst: number;
  igst: number;
  roundOff: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  isInterstate: boolean;
  gstEnabled: boolean;
}

interface TotalsRowProps {
  label: string;
  value: string;
  variant?: "default" | "muted" | "prominent";
}

const labelClass: Record<string, string> = {
  default: "text-body-sm text-ink-2",
  muted: "text-body-sm text-ink-3",
  prominent: "text-body-sm font-black text-ink",
};

const valueClass: Record<string, string> = {
  default: "tabular text-body-sm text-ink-2",
  muted: "tabular text-body-sm text-ink-3",
  prominent: "tabular text-money-sm font-black text-ink",
};

function TotalsRow({ label, value, variant = "default" }: TotalsRowProps) {
  return (
    <div
      className={cn(
        "flex justify-between",
        variant === "prominent" ? "items-baseline" : "items-center py-0.5",
      )}
    >
      <dt className={labelClass[variant]}>{label}</dt>
      <dd className={valueClass[variant]}>{value}</dd>
    </div>
  );
}

function GstRows({
  gstEnabled,
  isInterstate,
  cgst,
  sgst,
  igst,
}: Pick<PayTotalsProps, "gstEnabled" | "isInterstate" | "cgst" | "sgst" | "igst">) {
  if (!gstEnabled) return null;
  if (isInterstate) {
    return igst > 0 ? <TotalsRow label="IGST" value={formatPaise(igst)} /> : null;
  }
  return (
    <>
      {cgst > 0 && <TotalsRow label="CGST" value={formatPaise(cgst)} />}
      {sgst > 0 && <TotalsRow label="SGST" value={formatPaise(sgst)} />}
    </>
  );
}

export function PayTotals({
  subtotal,
  discount,
  cgst,
  sgst,
  igst,
  roundOff,
  total,
  amountPaid,
  amountDue,
  isInterstate,
  gstEnabled,
}: PayTotalsProps) {
  return (
    <PayCard
      as="section"
      aria-label="Invoice totals"
      className="px-6 py-5 max-mobile:px-4 max-mobile:py-4"
    >
      <div className="flex justify-end">
        <dl className="w-full max-w-xs">
          <TotalsRow label="Subtotal" value={formatPaise(subtotal)} />

          {discount > 0 && (
            <TotalsRow label="Discount" value={`−${formatPaise(discount)}`} variant="muted" />
          )}

          <GstRows
            gstEnabled={gstEnabled}
            isInterstate={isInterstate}
            cgst={cgst}
            sgst={sgst}
            igst={igst}
          />

          {roundOff !== 0 && (
            <TotalsRow
              label="Round-off"
              value={
                roundOff > 0 ? `+${formatPaise(roundOff)}` : `−${formatPaise(Math.abs(roundOff))}`
              }
              variant="muted"
            />
          )}

          <div>
            <hr className="my-3 border-t border-border" />
          </div>

          <TotalsRow label="Total" value={formatPaise(total)} variant="prominent" />

          {amountPaid > 0 && (
            <div className="mt-3 flex items-center justify-between py-0.5">
              <dt className="text-body-sm text-paid-ink">Amount paid</dt>
              <dd className="tabular text-body-sm text-paid-ink">−{formatPaise(amountPaid)}</dd>
            </div>
          )}

          {amountDue > 0 && (
            <>
              <div>
                <hr className="my-3 border-t border-border" />
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-body font-black text-ink">Amount due</dt>
                <dd className="tabular text-money-sm font-black text-coral">
                  {formatPaise(amountDue)}
                </dd>
              </div>
            </>
          )}
        </dl>
      </div>
    </PayCard>
  );
}
