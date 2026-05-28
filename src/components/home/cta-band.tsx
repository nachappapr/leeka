import Link from "next/link"

import { ArrowRight } from "@/components/icons"
import { PillButton } from "@/components/ui/custom/pill-button"
import { CTA_BAND } from "@/lib/constants/home"

function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-coral to-coral-press py-24 text-center text-card max-mobile:py-16">
      {/* Decorative radial glows — aria-hidden */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* Top-right white glow */}
        <div className="absolute -top-30 -right-25 size-95 rounded-full bg-card/10 blur-2xl" />
        {/* Bottom-left black glow */}
        <div className="absolute -bottom-30 -left-25 size-80 rounded-full bg-ink/10 blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-8 max-mobile:px-5">
        <h2 className="mx-auto max-w-180 text-56 font-extrabold leading-tight tracking-tight max-mobile:text-32">
          Stop chasing payments.
          <br />
          Start running your shop.
        </h2>
        <p className="mx-auto mt-4.5 max-w-135 text-18 opacity-90 max-mobile:text-body">
          {CTA_BAND.body}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <PillButton tone="onCoral" size="lg" render={<Link href={CTA_BAND.primaryCta.href} />}>
            {CTA_BAND.primaryCta.label}
            <ArrowRight className="size-5" aria-hidden="true" />
          </PillButton>
          <PillButton
            tone="outline"
            size="lg"
            className="border-card/30 bg-ink/20 text-card hover:bg-ink/30"
            render={<Link href={CTA_BAND.secondaryCta.href} />}
          >
            {CTA_BAND.secondaryCta.label}
          </PillButton>
        </div>
      </div>
    </section>
  )
}

export { CtaBand }
