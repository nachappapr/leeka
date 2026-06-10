import type { RecentSearchEntry } from "@/lib/types/search";

const RECENT_SEARCHES_KEY = "arthapatra-recent-searches";

export function loadRecentSearches(): RecentSearchEntry[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveRecentSearches(items: RecentSearchEntry[]): void {
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(items.slice(0, 5)));
  } catch {}
}
