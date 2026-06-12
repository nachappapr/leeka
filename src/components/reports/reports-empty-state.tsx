import { BarChart2 } from "@/components/icons";

export function ReportsEmptyState() {
  return (
    <div className="flex flex-col items-center px-6 pt-10 pb-12 text-center max-mobile:px-4">
      <div
        aria-hidden="true"
        className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-coral-soft"
      >
        <BarChart2 className="size-7 text-coral" />
      </div>
      <h2 className="text-title-sm font-extrabold text-ink">No data yet</h2>
      <p className="mt-1.5 max-w-xs text-body-sm font-medium text-ink-3">
        Issue invoices to start seeing revenue trends and payment analytics here.
      </p>
    </div>
  );
}
