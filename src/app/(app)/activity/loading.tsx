import { ActivitySkeleton } from "@/components/activity/activity-skeleton";

export default function ActivityLoading() {
  return (
    <div role="status" aria-label="Loading activity" className="flex flex-1 flex-col">
      <span className="sr-only">Loading…</span>
      <ActivitySkeleton />
    </div>
  );
}
