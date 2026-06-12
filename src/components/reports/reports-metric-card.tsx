import { cn } from "@/lib/utils";

interface ReportsMetricCardProps {
  label: string;
  value: string;
  srContext?: string;
  className?: string;
}

export function ReportsMetricCard({ label, value, srContext, className }: ReportsMetricCardProps) {
  return (
    <div className={cn("flex flex-col gap-1.5 rounded-xl bg-card p-5 shadow-card", className)}>
      <span className="text-kicker font-black tracking-wider text-ink-3 uppercase">{label}</span>
      <span className="text-money-sm font-black tracking-snug text-ink">
        {value}
        {srContext && <span className="sr-only">{srContext}</span>}
      </span>
    </div>
  );
}
