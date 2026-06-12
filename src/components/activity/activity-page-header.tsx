import Link from "next/link";

import { Settings } from "@/components/icons";
import { pillButtonVariants } from "@/components/ui/custom/pill-button";
import { MarkAllReadButton } from "@/components/activity/mark-all-read-button";

interface ActivityPageHeaderProps {
  unreadCount: number;
}

export function ActivityPageHeader({ unreadCount }: ActivityPageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-26 font-extrabold tracking-snug text-ink max-mobile:text-title">
          Activity
        </h2>
        <p className="mt-0.5 text-body-sm font-medium text-ink-3">
          Everything that&rsquo;s happened across your shop, in one feed.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2 max-mobile:hidden">
        {unreadCount > 0 && (
          <MarkAllReadButton focusAfterId="activity-notification-settings-link" />
        )}
        <Link
          id="activity-notification-settings-link"
          href="/settings"
          className={pillButtonVariants({ tone: "outline", size: "sm" })}
        >
          <Settings className="size-4" aria-hidden />
          Notification settings
        </Link>
      </div>
    </header>
  );
}
