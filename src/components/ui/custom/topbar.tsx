import { Search } from "@/components/icons";
import { MobileMenuButton } from "@/components/ui/custom/mobile-menu-button";
import { NotificationPanel } from "@/components/ui/custom/notification-panel";
import { NOTIFICATIONS } from "@/lib/constants/notifications";
import { Input } from "@/components/ui/primitives/input";

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="sticky top-0 z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-border bg-background/85 px-7 py-3.5 backdrop-blur-md backdrop-saturate-150 max-tablet:grid-cols-[auto_1fr_auto] max-mobile:flex max-mobile:gap-2.5 max-mobile:px-4 max-mobile:py-3">
      <MobileMenuButton />

      <div className="min-w-0">
        <h1 className="truncate text-20 font-black tracking-snug text-ink max-mobile:text-17">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-label font-semibold text-ink-3">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex h-10 w-96 items-center gap-2.5 rounded-full border border-border bg-card px-3.5 max-tablet:w-full max-tablet:max-w-96 max-tablet:min-w-0 max-mobile:hidden">
        <Search className="size-4 shrink-0 text-ink-3" aria-hidden />
        <Input
          className="h-auto flex-1 rounded-none border-0 bg-transparent px-0 py-0 text-body-sm text-ink shadow-none focus-visible:border-0 focus-visible:ring-0 placeholder:text-ink-3 md:text-body-sm"
          placeholder="Search invoices, customers..."
          aria-label="Search invoices and customers"
        />
      </div>

      <div className="flex items-center justify-end gap-3 max-mobile:ml-auto">
        <NotificationPanel groups={NOTIFICATIONS} />
      </div>
    </header>
  );
}
