import { Check, Sparkles } from "@/components/icons";
import { SETTINGS_PLAN_FEATURES } from "@/lib/constants/settings";
import { UpgradeButton } from "@/components/billing/upgrade-button";
import type { PlanRow } from "@/lib/data/plan";

const BILLING_PERIOD_LABEL: Record<string, string> = {
  monthly: "month",
  yearly: "year",
  annual: "year",
};

interface PlanSectionProps {
  proPlan: PlanRow | null;
}

export function PlanSection({ proPlan }: PlanSectionProps) {
  const amount = proPlan?.amount_inr;
  const periodLabel = proPlan?.billing_period
    ? (BILLING_PERIOD_LABEL[proPlan.billing_period] ?? proPlan.billing_period)
    : null;

  return (
    <div
      className="rounded-xl bg-(image:--plan-bg) p-6 text-white shadow-card"
      // eslint-disable-next-line no-restricted-syntax -- data-driven CSS var: gradient has no semantic token
      style={{ ["--plan-bg" as string]: "linear-gradient(160deg,#1F1A14 0%,#3D2D1E 100%)" }}
    >
      <div className="mb-3 inline-flex items-center rounded-full bg-coral-ink px-2.5 py-1">
        <Sparkles size={12} className="mr-1.5 text-white" aria-hidden />
        <span className="text-kicker font-black tracking-wide text-white">UPGRADE</span>
      </div>

      <h2 className="m-0 text-h2 font-bold text-white">Go unlimited with Pro</h2>

      {amount !== undefined && periodLabel !== null ? (
        <div className="mt-1.5 font-sans">
          <span className="text-money-sm font-black text-white">₹{amount}</span>
          <span className="text-body-sm font-semibold text-white/70"> / {periodLabel}</span>
        </div>
      ) : (
        <p className="sr-only">Pricing is currently unavailable.</p>
      )}

      <ul
        className="mt-4.5 flex list-none flex-col gap-2.5 p-0 text-body-sm"
        aria-label="Plan features"
      >
        {SETTINGS_PLAN_FEATURES.map((feature) => (
          <li key={feature} className="flex items-center gap-2.5">
            <Check size={18} strokeWidth={2.4} className="shrink-0 text-coral" aria-hidden />
            {feature}
          </li>
        ))}
      </ul>

      <UpgradeButton tone="primary" size="lg" className="mt-5">
        Upgrade now
      </UpgradeButton>
    </div>
  );
}
