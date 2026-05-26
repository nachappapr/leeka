import { Download, Plus } from "@/components/icons";
import { PillButton } from "@/components/ui/custom/pill-button";

export function InvoicesPageHeader() {
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-26 font-black tracking-snug text-ink max-mobile:text-title">
          Invoices
        </h2>
        <p className="text-body-sm font-medium text-ink-3">
          All your invoices in one place. Filter, sort, or open any one.
        </p>
      </div>
      <div className="flex items-center gap-2 max-mobile:hidden">
        <PillButton tone="outline" size="md">
          <Download aria-hidden />
          Export CSV
        </PillButton>
        <PillButton tone="primary" size="lg">
          <Plus aria-hidden />
          New invoice
        </PillButton>
      </div>
    </header>
  );
}
