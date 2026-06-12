"use client";

import * as React from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/primitives/popover";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/primitives/sheet";
import { Button } from "@/components/ui/primitives/button";
import { Bell, XIcon } from "@/components/icons";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotificationHead } from "@/components/ui/custom/notification-head";
import { NotificationFooter } from "@/components/ui/custom/notification-footer";
import { NotificationGroup } from "@/components/ui/custom/notification-group";
import { NotificationEmpty } from "@/components/ui/custom/notification-empty";
import type { NotificationGroupData } from "@/lib/types/notifications";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface NotificationPanelProps {
  groups: NotificationGroupData[];
  onMarkAllRead?: () => void;
  viewAllHref?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const TRIGGER_CLASSES =
  "flex size-10 items-center justify-center rounded-full border border-border bg-card text-ink-2 hover:bg-surface-2 max-mobile:size-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2";

// ---------------------------------------------------------------------------
// Private PanelBody — defined outside the parent to avoid the
// "component created during render" lint rule. Receives all context as props.
// ---------------------------------------------------------------------------

interface PanelBodyProps {
  groups: NotificationGroupData[];
  unreadCount: number;
  hasNotifications: boolean;
  onMarkAllRead?: () => void;
  viewAllHref?: string;
  onClose: () => void;
}

function PanelBody({
  groups,
  unreadCount,
  hasNotifications,
  onMarkAllRead,
  viewAllHref,
  onClose,
}: PanelBodyProps) {
  return (
    <div className="flex flex-col max-h-[min(80vh,40rem)]">
      <NotificationHead
        unreadCount={unreadCount}
        markAllSlot={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onMarkAllRead}
            disabled={!onMarkAllRead || unreadCount === 0}
            className="h-8 px-2.5 text-label font-semibold text-ink-2 hover:text-ink focus-visible:ring-coral-press"
          >
            Mark all read
          </Button>
        }
        closeSlot={
          <button
            type="button"
            aria-label="Close notifications"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-ink-2 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press"
          >
            <XIcon className="size-4" aria-hidden />
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto">
        {hasNotifications ? (
          groups.map((g) => <NotificationGroup key={g.id} label={g.label} items={g.items} />)
        ) : (
          <NotificationEmpty />
        )}
      </div>
      <NotificationFooter viewAllHref={viewAllHref} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// NotificationPanel
// ---------------------------------------------------------------------------

export function NotificationPanel({
  groups,
  onMarkAllRead,
  viewAllHref,
  open: controlledOpen,
  onOpenChange,
}: NotificationPanelProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isMobile = useIsMobile();

  const open = controlledOpen ?? internalOpen;
  const setOpen = (value: boolean) => {
    setInternalOpen(value);
    onOpenChange?.(value);
  };

  const unreadCount = groups.reduce((n, g) => n + g.items.filter((i) => i.unread).length, 0);
  const hasNotifications = groups.some((g) => g.items.length > 0);

  const triggerLabel = unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications";

  const panelBodyProps: PanelBodyProps = {
    groups,
    unreadCount,
    hasNotifications,
    onMarkAllRead,
    viewAllHref,
    onClose: () => setOpen(false),
  };

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger aria-label={triggerLabel} className={TRIGGER_CLASSES}>
          <Bell className="size-5" aria-hidden />
        </SheetTrigger>
        <SheetContent
          side="top"
          showCloseButton={false}
          aria-labelledby="notification-panel-title"
          className="top-24 inset-x-3 rounded-2xl max-h-[calc(100vh-7rem)] p-0 overflow-hidden border"
        >
          <PanelBody {...panelBodyProps} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger aria-label={triggerLabel} className={TRIGGER_CLASSES}>
        <Bell className="size-5" aria-hidden />
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={8}
        aria-labelledby="notification-panel-title"
        className="w-96 max-w-[calc(100vw-2rem)] p-0 overflow-hidden"
      >
        <PanelBody {...panelBodyProps} />
      </PopoverContent>
    </Popover>
  );
}
