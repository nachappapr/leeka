import { CheckCircle2 } from "@/components/icons";
import { formatPaise } from "@/lib/utils";

interface PayPaidStateProps {
  amountPaid: number;
  invoiceNumber: string;
}

export function PayPaidState({ amountPaid, invoiceNumber }: PayPaidStateProps) {
  return (
    <section
      aria-label="Payment receipt"
      className="rounded-xl bg-paid-soft px-6 py-6 shadow-card max-mobile:px-4"
    >
      <div className="flex flex-col items-center text-center">
        <CheckCircle2 className="mb-3 size-10 text-paid" aria-hidden="true" />
        <h2 className="text-title-sm font-extrabold text-paid-ink">Payment confirmed</h2>
        <p className="mt-1 text-body-sm font-medium text-paid-ink">
          This invoice has been paid in full.
        </p>
      </div>
      <dl className="mt-4 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <dt className="text-body-sm font-medium text-paid-ink">Amount paid</dt>
          <dd className="tabular text-body-sm font-bold text-paid-ink">
            {formatPaise(amountPaid)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-body-sm font-medium text-paid-ink">Invoice</dt>
          <dd className="text-body-sm font-bold text-paid-ink">{invoiceNumber}</dd>
        </div>
      </dl>
    </section>
  );
}
