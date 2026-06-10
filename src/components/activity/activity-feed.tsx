"use client";

import { useState } from "react";
import { Bell } from "@/components/icons";
import { Card } from "@/components/ui/custom/card";
import { FilterChips } from "@/components/ui/custom/filter-chips";
import { NotificationGroup } from "@/components/ui/custom/notification-group";
import {
  ACTIVITY_FILTER_LABELS,
  ACTIVITY_FILTER_TONES,
  ACTIVITY_GROUP_LABELS,
  ACTIVITY_GROUP_ORDER,
} from "@/lib/constants/activity";
import type { ActivityFilterId } from "@/lib/types/activity";
import type { NotificationItemData } from "@/lib/types/notifications";

interface ActivityFeedProps {
  items: ReadonlyArray<NotificationItemData>;
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  const [activeFilter, setActiveFilter] = useState<ActivityFilterId>("all");

  const filterItems = (id: ActivityFilterId) =>
    id === "all" ? items : items.filter((n) => ACTIVITY_FILTER_TONES[id].includes(n.tone));

  const filtered = filterItems(activeFilter);

  const groups = ACTIVITY_GROUP_ORDER.map((g) => ({
    id: g,
    label: ACTIVITY_GROUP_LABELS[g],
    items: filtered.filter((n) => n.group === g),
  })).filter((g) => g.items.length > 0);

  const liveText =
    groups.length === 0
      ? "No activity for this filter."
      : `Showing ${filtered.length} activity item${filtered.length !== 1 ? "s" : ""}.`;

  const chipItems = (Object.keys(ACTIVITY_FILTER_TONES) as ActivityFilterId[]).map((id) => ({
    id,
    label: ACTIVITY_FILTER_LABELS[id],
    count: filterItems(id).length,
  }));

  return (
    <Card>
      {/* sr-only heading gives h3 group labels ("Today", "Yesterday"…) a proper h2 parent */}
      <h2 className="sr-only">Notification feed</h2>

      {/* Persistent live region — always in DOM so AT announces filter changes */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {liveText}
      </div>

      <FilterChips
        items={chipItems}
        value={activeFilter}
        onValueChange={(v) => setActiveFilter(v as ActivityFilterId)}
        ariaLabel="Filter activity"
        className="border-b border-border"
      />

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
    </Card>
  );
}
