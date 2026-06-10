import type { AgingBucket, AgingTone } from "@/lib/types";
import { Card } from "@/components/ui/custom/card";

// ── Tone → fill class map ────────────────────────────────────────────────────

const TONE_CLASS: Record<AgingTone, string> = {
  paid: "bg-paid",
  pending: "bg-pending-bar",
  overdue: "bg-overdue",
};

// ── Private sub-component ────────────────────────────────────────────────────

function AgingBar({ bucket }: { bucket: AgingBucket }) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
      <div className="w-20 text-label font-semibold text-ink-3">{bucket.label}</div>
      <div
        className="relative h-2 overflow-hidden rounded-full bg-surface-2"
        role="img"
        aria-label={`${bucket.label}: ${bucket.amount}, ${bucket.percent}% of outstanding`}
      >
        <div
          className={"h-full rounded-full " + TONE_CLASS[bucket.tone]}
          style={{ width: `${bucket.percent}%` }}
        />
      </div>
      <div className="tabular text-right text-body-sm font-bold text-ink">{bucket.amount}</div>
    </div>
  );
}

// ── Public component ─────────────────────────────────────────────────────────

export function MoneyAwaitedCard({ buckets }: { buckets: ReadonlyArray<AgingBucket> }) {
  return (
    <Card title="Money awaited · by age">
      <div className="flex flex-col gap-3 px-6 py-4">
        {buckets.map((bucket) => (
          <AgingBar key={bucket.label} bucket={bucket} />
        ))}
      </div>
    </Card>
  );
}
