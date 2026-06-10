import Link from "next/link";
import { Receipt, Users, WhatsApp, ChevronRight } from "@/components/icons";
import { cn } from "@/lib/utils";
import { QUICK_ACTIONS } from "@/lib/constants/empty-dashboard";
import type { QuickAction } from "@/lib/types/empty-dashboard";

const ICON_MAP = {
  Receipt,
  Users,
  WhatsApp,
} as const;

export function EmptyQuickActions() {
  return (
    <div className="rounded-xl bg-card p-6 shadow-card">
      <div className="mb-4">
        <p className="text-kicker font-extrabold uppercase tracking-wider text-coral">
          Or jump straight in
        </p>
        <h2 className="mt-1.5 text-title-sm font-extrabold tracking-snug text-ink">
          Try a quick action
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-3 max-tablet:grid-cols-1">
        {QUICK_ACTIONS.map((action) => (
          <QuickActionCard key={action.title} action={action} />
        ))}
      </div>
    </div>
  );
}

function QuickActionCard({ action }: { action: QuickAction }) {
  const IconComponent = ICON_MAP[action.icon];

  return (
    <Link
      href={action.href}
      className="group flex items-center gap-3.5 rounded-md border border-line bg-cream p-4 transition-colors hover:border-coral hover:bg-surface max-mobile:p-3.5"
    >
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl",
          action.bgClass,
          action.inkClass,
        )}
      >
        <IconComponent className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-body-sm font-extrabold tracking-snug text-ink">{action.title}</p>
        <p className="mt-0.5 text-label font-medium leading-snug text-ink-3">{action.sub}</p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-ink-3" aria-hidden />
    </Link>
  );
}
