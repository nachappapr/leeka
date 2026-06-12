import Link from "next/link";
import { Bell } from "@/components/icons";
import { Card } from "@/components/ui/custom/card";
import { NotificationGroup } from "@/components/ui/custom/notification-group";
import { ActivityFilterChips } from "@/components/activity/activity-filter-chips";
import { ActivityFeedAnnouncer } from "@/components/activity/activity-feed-announcer";
import { ACTIVITY_GROUP_LABELS, ACTIVITY_GROUP_ORDER } from "@/lib/constants/activity";
import type { ActivityFilterId } from "@/lib/types/activity";
import type { NotificationItemData } from "@/lib/types/notifications";

interface ActivityFeedProps {
  items: NotificationItemData[];
  filter: ActivityFilterId;
  page: number;
  hasNextPage: boolean;
}

export function ActivityFeed({ items, filter, page, hasNextPage }: ActivityFeedProps) {
  const groups = ACTIVITY_GROUP_ORDER.map((g) => ({
    id: g,
    label: ACTIVITY_GROUP_LABELS[g],
    items: items.filter((n) => n.group === g),
  })).filter((g) => g.items.length > 0);

  function paginationHref(targetPage: number) {
    const params = new URLSearchParams();
    if (filter !== "all") params.set("type", filter);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `/activity?${qs}` : "/activity";
  }

  const hasPrevPage = page > 1;

  return (
    <Card>
      <h2 className="sr-only">Notification feed</h2>

      <ActivityFeedAnnouncer count={items.length} filter={filter} />

      <ActivityFilterChips value={filter} className="border-b border-border" />

      {groups.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-14 text-center" role="status">
          <div className="flex size-14 items-center justify-center rounded-full bg-surface-2 text-ink-3">
            <Bell className="size-6" aria-hidden />
          </div>
          <p className="text-body-sm font-bold text-ink">No activity here yet</p>
          <p className="text-caption text-ink-3">
            Try a different filter, or check back after sending some invoices.
          </p>
        </div>
      ) : (
        <div>
          {groups.map((g) => (
            <NotificationGroup key={g.id} label={g.label} items={g.items} />
          ))}
        </div>
      )}

      {(hasPrevPage || hasNextPage) && (
        <nav
          aria-label="Activity pagination"
          className="flex items-center justify-between border-t border-border px-6 py-3"
        >
          <span className="sr-only">Page {page}</span>
          {hasPrevPage ? (
            <Link
              href={paginationHref(page - 1)}
              className="text-caption font-bold text-coral-ink hover:text-coral-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
            >
              Newer
            </Link>
          ) : (
            <span />
          )}
          {hasNextPage ? (
            <Link
              href={paginationHref(page + 1)}
              className="text-caption font-bold text-coral-ink hover:text-coral-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
            >
              Older
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </Card>
  );
}
