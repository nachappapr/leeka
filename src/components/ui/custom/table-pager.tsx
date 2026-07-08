import { ChevronLeft, ChevronRight } from "@/components/icons";

interface TablePagerProps {
  from: number;
  to: number;
  total?: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  isLoading: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function TablePager({
  from,
  to,
  total,
  canPreviousPage,
  canNextPage,
  isLoading,
  onPrevious,
  onNext,
}: TablePagerProps) {
  return (
    <div className="flex items-center justify-between border-t border-border px-6 py-3">
      <p className="text-body-sm text-ink-3">
        {typeof total === "number" ? `${from}–${to} of ${total}` : `${from}–${to}`}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => {
            if (isLoading) return;
            onPrevious();
          }}
          disabled={!canPreviousPage}
          aria-disabled={isLoading || undefined}
          aria-label="Previous page"
          className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-ink-2 hover:border-line-strong hover:bg-coral/5 hover:text-coral-press disabled:cursor-not-allowed disabled:opacity-40 aria-disabled:cursor-not-allowed aria-disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <button
          onClick={() => {
            if (isLoading) return;
            onNext();
          }}
          disabled={!canNextPage}
          aria-disabled={isLoading || undefined}
          aria-label="Next page"
          className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-ink-2 hover:border-line-strong hover:bg-coral/5 hover:text-coral-press disabled:cursor-not-allowed disabled:opacity-40 aria-disabled:cursor-not-allowed aria-disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
