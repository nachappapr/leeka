import { CheckCircle2 } from "@/components/icons";

export function PayPaidState() {
  return (
    <section
      aria-label="Payment complete"
      className="rounded-xl bg-paid-soft px-6 py-6 text-center shadow-card max-mobile:px-4"
    >
      <CheckCircle2 className="mx-auto mb-3 size-10 text-paid" aria-hidden="true" />
      <p className="text-title-sm font-extrabold text-paid-ink">All paid up!</p>
      <p className="mt-1 text-body-sm font-medium text-paid-ink">
        This invoice has no outstanding balance.
      </p>
    </section>
  );
}
