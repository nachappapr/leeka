import { MobileTabBar } from "@/components/ui/custom/mobile-tab-bar";
import { EmptyStateSwitch } from "@/components/ui/custom/empty-state-switch";
import { EmptyTableState } from "@/components/ui/custom/empty-table-state";
import { Topbar } from "@/components/ui/custom/topbar";
import { TopbarNotifications } from "@/components/ui/custom/topbar-notifications";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { ActivityGlanceCard } from "@/components/activity/activity-glance-card";
import { ActivityPrefsCard } from "@/components/activity/activity-prefs-card";
import { ActivityPageHeader } from "@/components/activity/activity-page-header";
import { getActivityEvents, getActivityGlanceCounts } from "@/lib/data/activity";
import { getUnreadNotificationCount } from "@/lib/data/notifications";
import type { ActivityFilterId } from "@/lib/types/activity";

interface ActivityContainerProps {
  filter: ActivityFilterId;
  page: number;
}

export async function ActivityContainer({ filter, page }: ActivityContainerProps) {
  const [{ items, hasNextPage }, glanceRows, unreadCount] = await Promise.all([
    getActivityEvents({ filter, page }),
    getActivityGlanceCounts(),
    getUnreadNotificationCount(),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <Topbar
        title="Activity"
        subtitle="Everything happening across your shop"
        notificationsSlot={<TopbarNotifications />}
      />

      <div className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-3.5 max-mobile:p-4 max-mobile:pb-24">
        <ActivityPageHeader unreadCount={unreadCount} />

        <EmptyStateSwitch
          empty={
            <EmptyTableState
              icon="Bell"
              title="No activity yet"
              body="When you send invoices and get paid, the timeline will show up here."
            />
          }
          populated={
            <div className="flex gap-5 max-tablet:flex-col">
              <div className="min-w-0 flex-1">
                <ActivityFeed items={items} filter={filter} page={page} hasNextPage={hasNextPage} />
              </div>
              <aside
                aria-label="Activity summary"
                className="flex w-72 shrink-0 flex-col gap-5 max-tablet:hidden"
              >
                <ActivityGlanceCard rows={glanceRows} />
                <ActivityPrefsCard />
              </aside>
            </div>
          }
        />
      </div>

      <MobileTabBar />
    </div>
  );
}
