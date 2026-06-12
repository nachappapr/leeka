"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { NotificationPanel } from "@/components/ui/custom/notification-panel";
import { brandToast } from "@/components/ui/custom/brand-toast";
import { markAllNotificationsRead } from "@/app/(app)/activity/actions";
import type { NotificationGroupData } from "@/lib/types/notifications";

interface TopbarNotificationsClientProps {
  groups: NotificationGroupData[];
}

/*
 * Wraps NotificationPanel with:
 * - mark-all-read wired to the server action + router.refresh() on success
 * - 60s poll via router.refresh() to pick up new notifications; skips while
 *   the document is hidden (background tab) and while the panel is open to
 *   avoid closing the popover mid-interaction.
 *
 * Poll chosen over Supabase Realtime: no client-side realtime infrastructure
 * exists in the app; router.refresh() re-runs server fetches without new auth
 * plumbing and is already used project-wide for optimistic refresh.
 */
export function TopbarNotificationsClient({ groups }: TopbarNotificationsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [panelOpen, setPanelOpen] = React.useState(false);

  React.useEffect(() => {
    const id = setInterval(() => {
      if (document.hidden || panelOpen) return;
      router.refresh();
    }, 60_000);
    return () => clearInterval(id);
  }, [router, panelOpen]);

  function handleMarkAllRead() {
    startTransition(async () => {
      const result = await markAllNotificationsRead();
      if (result.ok) {
        brandToast.success({ title: "All notifications marked as read" });
        router.refresh();
      } else {
        brandToast.error({ title: result.error });
      }
    });
  }

  return (
    <NotificationPanel
      groups={groups}
      onMarkAllRead={isPending ? undefined : handleMarkAllRead}
      viewAllHref="/activity"
      open={panelOpen}
      onOpenChange={setPanelOpen}
    />
  );
}
