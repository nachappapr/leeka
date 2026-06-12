import { ActivityContainer } from "@/components/activity/activity-container";
import type { ActivityFilterId } from "@/lib/types/activity";

interface ActivityPageProps {
  searchParams: Promise<{ type?: string; page?: string }>;
}

const VALID_FILTERS: ActivityFilterId[] = ["all", "payments", "views", "reminders"];

function parseFilter(raw: string | undefined): ActivityFilterId {
  if (raw && (VALID_FILTERS as string[]).includes(raw)) {
    return raw as ActivityFilterId;
  }
  return "all";
}

function parsePage(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

export default async function ActivityPage({ searchParams }: ActivityPageProps) {
  const { type, page } = await searchParams;
  const filter = parseFilter(type);
  const pageNum = parsePage(page);

  return <ActivityContainer filter={filter} page={pageNum} />;
}
