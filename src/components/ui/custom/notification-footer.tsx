import Link from "next/link";

import { ChevronRight, Settings } from "@/components/icons";

interface NotificationFooterProps {
  /** Href for "View all activity". Defaults to "/activity". */
  viewAllHref?: string;
  /** Href for the notification settings icon. Defaults to "/settings/notifications". */
  settingsHref?: string;
}

function NotificationFooter({
  viewAllHref = "/activity",
  settingsHref = "/settings/notifications",
}: NotificationFooterProps) {
  return (
    <footer className="flex shrink-0 items-center justify-between border-t border-border bg-background px-2.5 py-2">
      <Link
        href={viewAllHref}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-label font-semibold text-ink-2 hover:text-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press"
      >
        View all activity
        <ChevronRight className="size-3.5" aria-hidden />
      </Link>
      <Link
        href={settingsHref}
        aria-label="Notification settings"
        className="flex size-8 items-center justify-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-ink-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press"
      >
        <Settings className="size-4" aria-hidden />
      </Link>
    </footer>
  );
}

export { NotificationFooter };
