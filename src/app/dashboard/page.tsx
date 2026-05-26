import {
  Bell,
  Clock,
  Download,
  IndianRupee,
  Plus,
  Search,
} from "@/components/icons";
import { ActivityCard } from "@/components/ui/custom/activity-card";
import { Card } from "@/components/ui/custom/card";
import { CustomerCell } from "@/components/ui/custom/customer-cell";
import { DataTable, DataHeader, DataHead, DataBody, DataRow, DataCell } from "@/components/ui/custom/data-table";
import { DataListRow } from "@/components/ui/custom/data-list-row";
import { MoneyAwaitedCard } from "@/components/ui/custom/money-awaited-card";
import { PillButton } from "@/components/ui/custom/pill-button";
import { StatusPill } from "@/components/ui/custom/status-pill";
import { cn } from "@/lib/utils";
import {
  ACTIVITY_ITEMS,
  AGING_BUCKETS,
  FILTER_CHIPS,
  INVOICES,
  MOBILE_TABS,
} from "@/lib/constants";

// ── Sub-components ──────────────────────────────────────────────────────────

function Topbar() {
  return (
    <header className="sticky top-0 z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-border bg-background/85 px-7 py-3.5 backdrop-blur-md backdrop-saturate-150 max-md:flex max-md:gap-2.5 max-md:px-4">
      {/* Left: title */}
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-ink">
          Dashboard
        </h1>
        <p className="text-xs font-semibold text-ink-3">
          Overview of your business
        </p>
      </div>

      {/* Center: search */}
      <div className="flex h-10 w-96 items-center gap-2.5 rounded-full border border-border bg-card px-3.5 max-md:hidden">
        <Search className="size-4 shrink-0 text-ink-3" aria-hidden />
        <input
          className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
          placeholder="Search invoices, customers..."
          aria-label="Search invoices and customers"
        />
      </div>

      {/* Right: actions */}
      <div className="flex items-center justify-end gap-3 max-md:ml-auto">
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-ink-2 hover:bg-surface-2"
        >
          <Bell className="size-5" aria-hidden />
        </button>
        <PillButton tone="primary">
          <Plus className="size-4" aria-hidden />
          <span className="max-md:hidden">New invoice</span>
        </PillButton>
      </div>
    </header>
  );
}

function HeroGrid() {
  return (
    <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
      {/* Hero tile — 2fr on desktop, full-width on tablet, stacked on mobile */}
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

      {/* Received this month */}
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

      {/* Overdue */}
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

function InvoicesCard() {
  return (
    <Card
      title="Recent invoices"
      action={
        <button
          type="button"
          className="text-sm font-bold text-coral-press hover:text-coral-ink"
        >
          View all
        </button>
      }
    >
      <FilterChips />
      <DataTable className="table-fixed max-md:hidden">
        <DataHeader>
          <DataRow className="cursor-default hover:bg-background">
            <DataHead className="w-2/6 pl-6">Customer</DataHead>
            <DataHead className="w-1/6">Invoice #</DataHead>
            <DataHead className="w-1/6">Date</DataHead>
            <DataHead className="w-1/6">Status</DataHead>
            <DataHead className="w-1/6 pr-6 text-right">Amount</DataHead>
          </DataRow>
        </DataHeader>
        <DataBody>
          {INVOICES.map((inv) => (
            <DataRow key={inv.id}>
              <DataCell className="pl-6">
                <CustomerCell customer={inv.customer} city={inv.city} />
              </DataCell>
              <DataCell className="text-sm font-medium text-ink-2">{inv.id}</DataCell>
              <DataCell className="text-sm text-ink-2">{inv.date}</DataCell>
              <DataCell>
                <StatusPill status={inv.status} />
              </DataCell>
              <DataCell className="tabular pr-6 text-right text-sm font-bold text-ink">
                {inv.amount}
              </DataCell>
            </DataRow>
          ))}
        </DataBody>
      </DataTable>
      <ul
        aria-label="Recent invoices"
        className="flex flex-col gap-3 p-4 md:hidden"
      >
        {INVOICES.map((inv) => (
          <DataListRow key={inv.id} invoice={inv} />
        ))}
      </ul>
    </Card>
  );
}

function FilterChips() {
  return (
    <div className="flex items-center gap-2 overflow-x-auto px-6 py-3 scrollbar-none">
      {FILTER_CHIPS.map((chip) => (
        <button
          key={chip.label}
          type="button"
          aria-pressed={chip.active}
          className={cn(
            "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-bold transition-colors",
            chip.active
              ? "bg-ink text-white"
              : "border border-border bg-card text-ink-2 hover:bg-surface-2",
          )}
        >
          {chip.label}
          <span
            className={cn(
              "rounded-full px-2 py-px text-xs font-extrabold",
              chip.active
                ? "bg-white/20 text-white"
                : "bg-background text-ink-3",
            )}
          >
            {chip.count}
          </span>
        </button>
      ))}
    </div>
  );
}

function MobileTabBar() {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {MOBILE_TABS.map((tab) =>
        tab.isPrimary ? (
          <button
            key="new"
            type="button"
            aria-label="New invoice"
            className="-mt-4 mx-auto flex h-14 w-14 items-center justify-center self-center rounded-full bg-coral shadow-coral"
          >
            <tab.icon className="size-6 text-white" aria-hidden />
          </button>
        ) : (
          <button
            key={tab.label}
            type="button"
            aria-label={tab.label}
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-2 text-xs font-bold",
              tab.active ? "text-coral" : "text-ink-3",
            )}
          >
            <tab.icon className="size-5" aria-hidden />
            <span>{tab.label}</span>
          </button>
        ),
      )}
    </nav>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Topbar />
      <div className="flex flex-1 flex-col gap-5 p-7 max-md:p-4 max-md:pb-24">
        {/* Page greeting header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-ink">
              Namaste, Raj 👋
            </h2>
            <p className="mt-0.5 text-sm text-ink-2">
              Here&apos;s how your shop is doing today.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <PillButton tone="outline">
              <Download className="size-4" aria-hidden />
              Export
            </PillButton>
          </div>
        </div>

        <HeroGrid />
        <div className="grid grid-cols-[2fr_1fr] gap-5 max-lg:grid-cols-1">
          <InvoicesCard />
          <div className="flex flex-col gap-5">
            <ActivityCard items={ACTIVITY_ITEMS} />
            <MoneyAwaitedCard buckets={AGING_BUCKETS} />
          </div>
        </div>
      </div>
      <MobileTabBar />
    </div>
  );
}
