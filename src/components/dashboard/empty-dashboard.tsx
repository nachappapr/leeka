import { EmptyDashboardHero } from "@/components/dashboard/empty-dashboard-hero";
import { EmptySetupChecklist } from "@/components/dashboard/empty-setup-checklist";
import { EmptyPreviewRail } from "@/components/dashboard/empty-preview-rail";
import { EmptyHelpCard } from "@/components/dashboard/empty-help-card";
import { EmptyQuickActions } from "@/components/dashboard/empty-quick-actions";

export function EmptyDashboard() {
  return (
    <div className="flex flex-col gap-5 max-mobile:gap-3.5">
      <EmptyDashboardHero />

      <div className="grid grid-cols-[1.6fr_1fr] gap-4 max-tablet:grid-cols-1">
        <EmptySetupChecklist />

        <div className="flex flex-col gap-4">
          <EmptyPreviewRail />
          <EmptyHelpCard />
        </div>
      </div>

      <EmptyQuickActions />
    </div>
  );
}
