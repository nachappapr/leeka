"use client";

interface ActivityFeedAnnouncerProps {
  count: number;
  filter: string;
}

export function ActivityFeedAnnouncer({ count, filter }: ActivityFeedAnnouncerProps) {
  const message =
    count === 0
      ? "No activity for this filter."
      : `Showing ${count} activity item${count !== 1 ? "s" : ""}.`;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-filter={filter}
      className="sr-only"
    >
      {message}
    </div>
  );
}
