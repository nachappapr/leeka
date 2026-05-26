import { Clock, IndianRupee } from "@/components/icons";

export function HeroGrid() {
  return (
    <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
      <div className="relative col-span-2 overflow-hidden rounded-2xl bg-linear-to-br from-coral to-coral-deep p-7 shadow-coral-hero max-md:col-span-1">
        <span
          className="pointer-events-none absolute -right-10 -top-10 size-45 rounded-full bg-white/12"
          aria-hidden="true"
        />
        <div className="text-12 font-extrabold uppercase tracking-wide leading-tight text-white/90">
          Total outstanding
        </div>
        <div className="tabular mt-2.5 text-56 font-extrabold tracking-tight leading-tight text-white">
          ₹13,200
        </div>
        <div className="mt-3.5 flex items-center gap-3 text-13 font-semibold text-white">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-2.5 py-1">
            <span
              className="size-1.5 rounded-full bg-pending-bright"
              aria-hidden="true"
            />
            3 unpaid invoices
          </span>
          <span className="text-white/85">1 overdue · 2 sent</span>
        </div>
      </div>

      <div className="rounded-2xl bg-card p-6 shadow-card">
        <div className="flex items-start justify-between gap-2">
          <div className="text-12 font-extrabold uppercase tracking-wide text-ink-3">
            Received this month
          </div>
          <div className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-md bg-paid-soft">
            <IndianRupee className="size-4 text-paid" aria-hidden />
          </div>
        </div>
        <div className="tabular text-32 font-extrabold tracking-tight text-paid-ink">
          ₹68,200
        </div>
        <div className="mt-1.5 text-13 text-ink-2">↗12% vs last month</div>
      </div>

      <div className="rounded-2xl bg-card p-6 shadow-card">
        <div className="flex items-start justify-between gap-2">
          <div className="text-12 font-extrabold uppercase tracking-wide text-ink-3">
            Overdue
          </div>
          <div className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-md bg-coral-soft">
            <Clock className="size-4 text-coral" aria-hidden />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="tabular text-32 font-extrabold tracking-tight text-overdue-ink">
            1
          </span>
          <span className="text-16 font-semibold text-ink-2">· ₹2,400</span>
        </div>
        <div className="mt-1.5 text-13 text-overdue">
          Send a friendly nudge?
        </div>
      </div>
    </div>
  );
}
