import { Asterisk } from "@/components/icons";
import { MobileTabBar } from "@/components/ui/custom/mobile-tab-bar";
import { Topbar } from "@/components/ui/custom/topbar";
import { TopbarNotifications } from "@/components/ui/custom/topbar-notifications";

export function ReportsContainer() {
  return (
    <div className="flex flex-1 flex-col">
      <Topbar
        title="Reports"
        subtitle="Business insights and analytics"
        notificationsSlot={<TopbarNotifications />}
      />

      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-7 max-mobile:p-4 max-mobile:pb-24">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-coral-soft">
          <Asterisk className="size-8 text-coral" aria-hidden />
        </div>
        <div className="text-center">
          <h2 className="text-title font-extrabold text-ink">Reports coming soon</h2>
          <p className="mt-1.5 max-w-xs text-body-sm font-medium text-ink-3">
            Business analytics, payment trends, and GST summaries will live here.
          </p>
        </div>
      </div>

      <MobileTabBar />
    </div>
  );
}
