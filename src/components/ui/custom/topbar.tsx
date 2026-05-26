import { Bell, Plus, Search } from "@/components/icons";
import { MobileMenuButton } from "@/components/ui/custom/mobile-menu-button";
import { PillButton } from "@/components/ui/custom/pill-button";

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="sticky top-0 z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-border bg-background/85 px-7 py-3.5 backdrop-blur-md backdrop-saturate-150 max-md:flex max-md:gap-2.5 max-md:px-4">
      <MobileMenuButton />

      <div className="min-w-0">
        <h1 className="truncate text-xl font-extrabold tracking-tight text-ink max-md:text-lg">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-xs font-semibold text-ink-3">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex h-10 w-96 items-center gap-2.5 rounded-full border border-border bg-card px-3.5 max-md:hidden">
        <Search className="size-4 shrink-0 text-ink-3" aria-hidden />
        <input
          className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
          placeholder="Search invoices, customers..."
          aria-label="Search invoices and customers"
        />
      </div>

      <div className="flex items-center justify-end gap-3 max-md:ml-auto">
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-ink-2 hover:bg-surface-2"
        >
          <Bell className="size-5" aria-hidden />
        </button>
        <PillButton tone="primary" className="max-md:hidden">
          <Plus className="size-4" aria-hidden />
          <span>New invoice</span>
        </PillButton>
      </div>
    </header>
  );
}
