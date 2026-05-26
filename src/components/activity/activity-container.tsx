import Link from "next/link"
import { Settings } from "@/components/icons"
import { MobileTabBar } from "@/components/ui/custom/mobile-tab-bar"
import { pillButtonVariants } from "@/components/ui/custom/pill-button"
import { Topbar } from "@/components/ui/custom/topbar"
import { ActivityFeed } from "@/components/activity/activity-feed"
import { ActivityGlanceCard } from "@/components/activity/activity-glance-card"
import { ActivityPrefsCard } from "@/components/activity/activity-prefs-card"
import { MarkAllReadButton } from "@/components/activity/mark-all-read-button"
import {
  ACTIVITY_GLANCE_ROWS,
  ACTIVITY_UNREAD_COUNT,
} from "@/lib/constants/activity"
import { ACTIVITY_NOTIFICATIONS } from "@/lib/constants/notifications"

export function ActivityContainer() {
  return (
    <div className="flex flex-1 flex-col">
      <Topbar title="Activity" subtitle="Everything happening across your shop" />

      <div className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-3.5 max-mobile:p-4 max-mobile:pb-24">
        {/* Page header */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-26 font-extrabold tracking-snug text-ink max-mobile:text-title">
              Activity
            </h2>
            <p className="mt-0.5 text-body-sm font-medium text-ink-3">
              Everything that&rsquo;s happened across your shop, in one feed.
            </p>
          </div>
          {/* Desktop-only action buttons */}
          <div className="flex shrink-0 items-center gap-2 max-mobile:hidden">
            {ACTIVITY_UNREAD_COUNT > 0 && <MarkAllReadButton />}
            <Link
              href="/settings"
              className={pillButtonVariants({ tone: "outline", size: "sm" })}
            >
              <Settings className="size-4" aria-hidden />
              Notification settings
            </Link>
          </div>
        </header>

        {/* Two-column layout: feed + sidebar */}
        <div className="flex gap-5 max-tablet:flex-col">
          {/* Main feed — takes all available width */}
          <div className="min-w-0 flex-1">
            <ActivityFeed items={ACTIVITY_NOTIFICATIONS} />
          </div>

          {/* Sidebar — visible only on desktop (>1100px) */}
          <aside
            aria-label="Activity summary"
            className="flex w-72 shrink-0 flex-col gap-5 max-tablet:hidden"
          >
            <ActivityGlanceCard rows={ACTIVITY_GLANCE_ROWS} />
            <ActivityPrefsCard />
          </aside>
        </div>
      </div>

      <MobileTabBar />
    </div>
  )
}
