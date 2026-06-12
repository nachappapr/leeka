import { getNotificationGroups } from "@/lib/data/notifications";
import { TopbarNotificationsClient } from "@/components/ui/custom/topbar-notifications-client";

export async function TopbarNotifications() {
  const groups = await getNotificationGroups();
  return <TopbarNotificationsClient groups={groups} />;
}
