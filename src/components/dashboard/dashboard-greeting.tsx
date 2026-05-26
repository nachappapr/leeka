import { Download, Plus } from "@/components/icons";
import { PillButton } from "@/components/ui/custom/pill-button";

export function DashboardGreeting() {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-26 font-black tracking-tight text-ink max-mobile:text-22">
          <span lang="hi">Namaste</span>, Raj <span aria-hidden="true">👋</span>
        </h2>
        <p className="mt-0.5 text-body-sm text-ink-2">
          Here&apos;s how your shop is doing today.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3 max-mobile:hidden">
        <PillButton tone="outline">
          <Download className="size-4" aria-hidden />
          Export
        </PillButton>
        <PillButton tone="primary">
          <Plus className="size-4" aria-hidden />
          New invoice
        </PillButton>
      </div>
    </div>
  );
}
