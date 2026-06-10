import { HelpCircle } from "@/components/icons";
import { MobileTabBar } from "@/components/ui/custom/mobile-tab-bar";
import { Topbar } from "@/components/ui/custom/topbar";

export function DashboardHelpContainer() {
  return (
    <div className="flex flex-1 flex-col">
      <Topbar title="Help" subtitle="Guides, FAQs, and support" />

      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-7 max-mobile:p-4 max-mobile:pb-24">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-info-soft">
          <HelpCircle className="size-8 text-info" aria-hidden />
        </div>
        <div className="text-center">
          <h2 className="text-title font-extrabold text-ink">Help centre coming soon</h2>
          <p className="mt-1.5 max-w-xs text-body-sm font-medium text-ink-3">
            Guides, frequently asked questions, and support resources will be available here.
          </p>
        </div>
      </div>

      <MobileTabBar />
    </div>
  );
}
