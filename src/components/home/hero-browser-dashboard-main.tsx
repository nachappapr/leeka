import { Plus } from "@/components/icons"

function BrowserDashboardMain() {
  return (
    <div className="bg-background p-5 px-5.5 overflow-auto">
      {/* Topbar */}
      <div className="flex items-center gap-3 mb-4">
        <h4 className="text-18 font-extrabold tracking-tight flex-1 max-mobile:text-16">
          Dashboard
        </h4>
        <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-coral text-card text-11 font-bold">
          <Plus className="size-2.5" strokeWidth={3} aria-hidden="true" />
          New invoice
        </span>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-[1.4fr_1fr_1fr] max-mobile:grid-cols-2 gap-2.5 max-mobile:gap-2 mb-3.5 max-mobile:mb-3">
        {/* Primary KPI — orange gradient */}
        <div className="relative overflow-hidden col-span-1 max-mobile:col-span-2 bg-linear-to-br from-coral to-coral-deep text-card border-0 rounded-xl p-3 px-3.5">
          <div className="absolute -right-7 -top-7 size-22 rounded-full bg-card/12" />
          <div className="relative text-10 font-extrabold uppercase tracking-wide opacity-90">
            Total outstanding
          </div>
          <div className="relative mt-1 text-22 font-extrabold tabular tracking-tight leading-none">
            &#8377;26,400
          </div>
          <div className="relative mt-1.5 text-10 font-semibold opacity-85">
            4 unpaid invoices
          </div>
        </div>

        {/* Paid this week */}
        <div className="bg-card border border-border rounded-xl p-3 px-3.5">
          <div className="text-10 font-extrabold uppercase tracking-wide text-ink-3">
            Paid &middot; this week
          </div>
          <div className="mt-1 text-22 font-extrabold tabular tracking-tight leading-none text-paid-ink">
            &#8377;18,925
          </div>
          <div className="mt-1.5 text-10 font-semibold text-ink-3">
            +12% vs last week
          </div>
        </div>

        {/* Avg. days to pay */}
        <div className="bg-card border border-border rounded-xl p-3 px-3.5">
          <div className="text-10 font-extrabold uppercase tracking-wide text-ink-3">
            Avg. days to pay
          </div>
          <div className="mt-1 text-22 font-extrabold tabular tracking-tight leading-none text-ink">
            3.2
          </div>
          <div className="mt-1.5 text-10 font-semibold text-ink-3">
            Down from 5.1
          </div>
        </div>
      </div>

      {/* Section head */}
      <div className="flex items-center gap-2 mb-2">
        <strong className="text-12 font-extrabold">Recent invoices</strong>
        <span className="ml-auto text-11 font-bold text-coral-press">View all &rarr;</span>
      </div>

      {/* Invoice table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1.7fr_0.7fr_0.65fr_0.65fr] max-mobile:grid-cols-[1.4fr_0.7fr_0.8fr] gap-2.5 px-3.5 py-2 bg-background text-10 font-extrabold uppercase tracking-wide text-ink-3 border-b border-border">
          <div>Customer</div>
          <div className="max-mobile:hidden">Invoice</div>
          <div>Status</div>
          <div className="text-right">Amount</div>
        </div>

        {/* Row 1 — Sharma Sweets / Paid */}
        <div className="grid grid-cols-[1.7fr_0.7fr_0.65fr_0.65fr] max-mobile:grid-cols-[1.4fr_0.7fr_0.8fr] gap-2.5 items-center px-3.5 py-2.5 border-b border-border text-12">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex size-6.5 shrink-0 items-center justify-center rounded-full text-10 font-extrabold bg-coral-soft text-coral-ink">SS</span>
            <div className="min-w-0">
              <div className="text-12 font-bold truncate">Sharma Sweets</div>
              <div className="text-10 text-ink-3 font-semibold">Today, 9:41</div>
            </div>
          </div>
          <div className="font-mono text-11 text-ink-3 font-bold max-mobile:hidden">INV-1024</div>
          <div>
            <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-px text-9 font-extrabold bg-paid-soft text-paid-ink">
              <span className="size-1.5 rounded-full bg-paid shrink-0" />Paid
            </span>
          </div>
          <div className="tabular font-extrabold text-right text-paid-ink">&#8377;4,725</div>
        </div>

        {/* Row 2 — Rohit Kumar / Sent */}
        <div className="grid grid-cols-[1.7fr_0.7fr_0.65fr_0.65fr] max-mobile:grid-cols-[1.4fr_0.7fr_0.8fr] gap-2.5 items-center px-3.5 py-2.5 border-b border-border text-12">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex size-6.5 shrink-0 items-center justify-center rounded-full text-10 font-extrabold bg-coral-soft text-coral-ink">RK</span>
            <div className="min-w-0">
              <div className="text-12 font-bold truncate">Rohit Kumar</div>
              <div className="text-10 text-ink-3 font-semibold">2 days ago</div>
            </div>
          </div>
          <div className="font-mono text-11 text-ink-3 font-bold max-mobile:hidden">INV-1023</div>
          <div>
            <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-px text-9 font-extrabold bg-info-soft text-info">
              <span className="size-1.5 rounded-full bg-info shrink-0" />Sent
            </span>
          </div>
          <div className="tabular font-extrabold text-right text-ink">&#8377;1,200</div>
        </div>

        {/* Row 3 — Anita Tailoring / Overdue */}
        <div className="grid grid-cols-[1.7fr_0.7fr_0.65fr_0.65fr] max-mobile:grid-cols-[1.4fr_0.7fr_0.8fr] gap-2.5 items-center px-3.5 py-2.5 border-b border-border text-12">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex size-6.5 shrink-0 items-center justify-center rounded-full text-10 font-extrabold bg-overdue-soft text-overdue-ink">AT</span>
            <div className="min-w-0">
              <div className="text-12 font-bold truncate">Anita Tailoring</div>
              <div className="text-10 text-ink-3 font-semibold">4 days ago</div>
            </div>
          </div>
          <div className="font-mono text-11 text-ink-3 font-bold max-mobile:hidden">INV-1019</div>
          <div>
            <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-px text-9 font-extrabold bg-overdue-soft text-overdue-ink">
              <span className="size-1.5 rounded-full bg-overdue shrink-0" />Overdue
            </span>
          </div>
          <div className="tabular font-extrabold text-right text-ink">&#8377;2,400</div>
        </div>

        {/* Row 4 — Patel Traders / Paid */}
        <div className="grid grid-cols-[1.7fr_0.7fr_0.65fr_0.65fr] max-mobile:grid-cols-[1.4fr_0.7fr_0.8fr] gap-2.5 items-center px-3.5 py-2.5 text-12">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex size-6.5 shrink-0 items-center justify-center rounded-full text-10 font-extrabold bg-paid-soft text-paid-ink">PT</span>
            <div className="min-w-0">
              <div className="text-12 font-bold truncate">Patel Traders</div>
              <div className="text-10 text-ink-3 font-semibold">5 days ago</div>
            </div>
          </div>
          <div className="font-mono text-11 text-ink-3 font-bold max-mobile:hidden">INV-1018</div>
          <div>
            <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-px text-9 font-extrabold bg-paid-soft text-paid-ink">
              <span className="size-1.5 rounded-full bg-paid shrink-0" />Paid
            </span>
          </div>
          <div className="tabular font-extrabold text-right text-paid-ink">&#8377;12,400</div>
        </div>
      </div>
    </div>
  )
}

export { BrowserDashboardMain }
