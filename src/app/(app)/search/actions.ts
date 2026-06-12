"use server";

import { searchAll } from "@/lib/data/search";
import type { SearchResults } from "@/lib/types/search";
import { EMPTY_SEARCH_RESULTS } from "@/lib/types/search";

const MAX_QUERY_LENGTH = 200;

export async function searchAction(query: string): Promise<SearchResults> {
  if (typeof query !== "string") return { ...EMPTY_SEARCH_RESULTS };

  const trimmed = query.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_QUERY_LENGTH) {
    return { ...EMPTY_SEARCH_RESULTS };
  }

  return searchAll(trimmed);
}
