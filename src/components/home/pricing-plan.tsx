import Link from "next/link"

import { Check } from "@/components/icons"
import { PillButton } from "@/components/ui/custom/pill-button"
import type { PricingPlan } from "@/lib/types/home"

function PricingPlanCard({ plan }: { plan: PricingPlan }) {
  if (!plan.highlighted) {
    return (
      <article className="rounded-2xl border-[1.5px] border-border bg-background px-7.5 pb-8 pt-8">
        {/* tagline badge */}
        <span className="mb-3.5 inline-block rounded-full bg-coral-soft px-2.5 py-0.5 text-11 font-extrabold uppercase tracking-wider text-coral-ink">
          {plan.tagline}
        </span>

        <h3 className="text-24 font-extrabold tracking-tight">{plan.name}</h3>

        {/* price */}
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-44 font-extrabold leading-none tracking-tight tabular-nums">
            {plan.price}
          </span>
          <span className="text-14 font-semibold text-ink-2/70">{plan.period}</span>
        </div>

        {/* feature list */}
        <ul className="mt-5.5 flex flex-col gap-2.5">
          {plan.features.map((feat) => (
            <li key={feat} className="flex items-start gap-2.5 text-14 font-medium">
              <Check
                className="mt-0.5 size-5 shrink-0 text-paid"
                strokeWidth={2.4}
                aria-hidden="true"
              />
              <span>{feat}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="mt-6">
          <PillButton
            tone="outline"
            size="md"
            className="w-full"
            render={<Link href={plan.ctaHref} />}
          >
            {plan.ctaLabel}
          </PillButton>
        </div>
      </article>
    )
  }

  return (
    <article className="relative overflow-hidden rounded-2xl bg-linear-to-br from-ink to-draft-ink px-7.5 pb-8 pt-8 text-card">
      {/* Decorative coral radial glow top-right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-15 -top-15 size-45 rounded-full bg-coral/18 blur-2xl"
      />

      {/* tagline badge */}
      <span className="relative mb-3.5 inline-block rounded-full bg-coral px-2.5 py-0.5 text-11 font-extrabold uppercase tracking-wider text-card">
        {plan.tagline}
      </span>

      <h3 className="relative text-24 font-extrabold tracking-tight">{plan.name}</h3>

      {/* price */}
      <div className="relative mt-1.5 flex items-baseline gap-1.5">
        <span className="text-44 font-extrabold leading-none tracking-tight tabular-nums">
          {plan.price}
        </span>
        <span className="text-14 font-semibold opacity-70">{plan.period}</span>
      </div>

      {/* feature list */}
      <ul className="relative mt-5.5 flex flex-col gap-2.5">
        {plan.features.map((feat) => (
          <li key={feat} className="flex items-start gap-2.5 text-14 font-medium">
            <Check
              className="mt-0.5 size-5 shrink-0 text-coral"
              strokeWidth={2.4}
              aria-hidden="true"
            />
            <span>{feat}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="relative mt-6">
        <PillButton
          tone="primary"
          size="md"
          className="w-full"
          render={<Link href={plan.ctaHref} />}
        >
          {plan.ctaLabel}
        </PillButton>
      </div>
    </article>
  )
}

export { PricingPlanCard }
