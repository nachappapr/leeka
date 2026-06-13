"use client";

import { PillButton } from "@/components/ui/custom/pill-button";

interface InvoicesLoadMoreProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export function InvoicesLoadMore({ hasMore, isLoading, onLoadMore }: InvoicesLoadMoreProps) {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center border-t border-border px-6 py-4">
      <PillButton
        tone="outline"
        size="sm"
        onClick={onLoadMore}
        disabled={isLoading}
        aria-busy={isLoading}
        aria-label="Load more invoices"
      >
        {isLoading ? "Loading…" : "Load more"}
      </PillButton>
    </div>
  );
}
