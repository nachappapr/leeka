"use client";

import { useRouter } from "next/navigation";
import { FilterChips } from "@/components/ui/custom/filter-chips";
import { ACTIVITY_FILTER_LABELS } from "@/lib/constants/activity";
import type { ActivityFilterId } from "@/lib/types/activity";

const FILTER_IDS: ActivityFilterId[] = ["all", "payments", "views", "reminders"];

interface ActivityFilterChipsProps {
  value: ActivityFilterId;
  className?: string;
}

export function ActivityFilterChips({ value, className }: ActivityFilterChipsProps) {
  const router = useRouter();

  const chipItems = FILTER_IDS.map((id) => ({
    id,
    label: ACTIVITY_FILTER_LABELS[id],
  }));

  function handleValueChange(id: string) {
    const params = new URLSearchParams();
    if (id !== "all") params.set("type", id);
    const qs = params.toString();
    router.replace(qs ? `/activity?${qs}` : "/activity");
  }

  return (
    <FilterChips
      items={chipItems}
      value={value}
      onValueChange={handleValueChange}
      ariaLabel="Filter activity"
      className={className}
    />
  );
}
