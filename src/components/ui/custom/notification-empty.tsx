import { BellOff } from "@/components/icons";

export function NotificationEmpty() {
  return (
    <div className="flex flex-col items-center text-center px-6 py-10" role="status">
      <div className="size-14 rounded-full bg-surface-2 text-ink-3 mb-3 flex items-center justify-center">
        <BellOff className="size-6" aria-hidden="true" />
      </div>
      <p className="text-title-sm text-ink">All caught up</p>
      <p className="text-caption text-ink-3 mt-1 max-w-xs">
        We&rsquo;ll let you know when something needs your attention.
      </p>
    </div>
  );
}
