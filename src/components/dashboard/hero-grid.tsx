import { Clock, IndianRupee } from "@/components/icons";
import type { DashboardSummary } from "@/lib/types/dashboard";
import { formatPaise } from "@/lib/utils";

interface HeroGridProps {
  summary: DashboardSummary;
}

export function HeroGrid({ summary }: HeroGridProps) {
  const {
    outstanding_amount,
    outstanding_count,
    overdue_count,
    overdue_amount,
    paid_this_month,
    status_counts,
  } = summary;

  const unpaidCount = outstanding_count;
  const overdueCount = overdue_count;
  const sentCount = status_counts.sent + status_counts.viewed;

  return (
    <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 max-tablet:grid-cols-2 max-mobile:grid-cols-1 max-mobile:gap-3">
      <div className="relative overflow-hidden rounded-xl bg-linear-135 from-coral to-coral-deep p-7 shadow-coral-hero max-tablet:col-span-2 max-mobile:col-span-1 max-mobile:p-5">
        <span
          className="pointer-events-none absolute -right-10 -top-10 size-45 rounded-full bg-white/12"
          aria-hidden="true"
        />
        <dl>
          <dt className="text-label font-black uppercase tracking-wide leading-tight text-white">
            Total outstanding
          </dt>
          <dd className="tabular mt-2.5 text-h1 font-black text-white">
            {formatPaise(outstanding_amount)}
          </dd>
        </dl>
        <div className="mt-3.5 flex items-center gap-3 text-caption font-semibold text-white">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/18 px-2.5 py-1">
            <span className="size-1.5 rounded-full bg-pending-bright" aria-hidden="true" />
            {unpaidCount} unpaid {unpaidCount === 1 ? "invoice" : "invoices"}
          </span>
          <span className="text-white">
            {overdueCount} overdue{" "}
            <span aria-hidden="true" className="mx-1">
              ·
            </span>{" "}
            {sentCount} sent
          </span>
        </div>
      </div>

      <div className="rounded-xl bg-card p-6 shadow-card max-mobile:p-4">
        <dl>
          <div className="flex items-start justify-between gap-2">
            <dt className="text-label font-black uppercase tracking-wide text-ink-3">
              Received this month
            </dt>
            <div className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-md bg-paid-soft">
              <IndianRupee className="size-4 text-paid" aria-hidden />
            </div>
          </div>
          <dd className="tabular text-money-sm text-paid-ink">{formatPaise(paid_this_month)}</dd>
        </dl>
        <div className="mt-1.5 text-caption text-ink-2">↗12% vs last month</div>
      </div>

      <div className="rounded-xl bg-card p-6 shadow-card max-mobile:p-4">
        <dl>
          <div className="flex items-start justify-between gap-2">
            <dt className="text-label font-black uppercase tracking-wide text-ink-3">Overdue</dt>
            <div className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-md bg-coral-soft">
              <Clock className="size-4 text-coral" aria-hidden />
            </div>
          </div>
          <dd className="flex items-baseline gap-2">
            <span className="tabular text-money-sm text-overdue-ink">{overdue_count}</span>
            <span className="text-body font-semibold text-ink-2">
              <span aria-hidden="true" className="mr-1">
                ·
              </span>
              {formatPaise(overdue_amount)}
            </span>
          </dd>
        </dl>
        <div className="mt-1.5 text-caption text-overdue">Send a friendly nudge?</div>
      </div>
    </div>
  );
}
