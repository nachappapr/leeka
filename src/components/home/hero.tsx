import Link from "next/link";

import { ArrowRight, PlayCircle, Check, HeroUnderline } from "@/components/icons";
import { PillButton } from "@/components/ui/custom/pill-button";
import { HERO_META } from "@/lib/constants/home";
import { HeroBrowserMock } from "@/components/home/hero-browser-mock";
import { HeroFloatingCards } from "@/components/home/hero-floating-cards";

function Hero() {
  return (
    <section className="relative overflow-hidden pt-14 pb-20 max-tablet:pt-10 max-tablet:pb-14">
      {/* Decorative glow blobs — aria-hidden so AT skips them */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        {/* Top-right coral glow: design uses rgba(244,106,57,0.18) radial → coral/18 blur */}
        <div className="absolute -top-30 -right-40 size-120 rounded-full bg-coral/15 blur-3xl pointer-events-none" />
        {/* Bottom-left teal/paid glow: design uses rgba(14,143,138,0.10) — deviation: mapped to bg-paid/10 (green vs teal) */}
        <div className="absolute -bottom-25 -left-40 size-90 rounded-full bg-paid/10 blur-3xl pointer-events-none" />
      </div>

      {/* Container */}
      <div className="mx-auto max-w-7xl px-8 max-mobile:px-5">
        {/* Two-column grid — 0.85fr left / 1.15fr right gives the browser mock more visual room */}
        <div className="grid grid-cols-[0.85fr_1.15fr] items-center gap-16 max-tablet:gap-10 max-mobile:grid-cols-1 max-mobile:gap-8">
          {/* ── Left column: content ── */}
          <div>
            {/* Eyebrow pill */}
            <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-coral-soft px-3.5 py-1.5 text-12 font-extrabold tracking-wider text-coral-ink">
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-paid ring-[3px] ring-paid/20"
              />
              Free · Made in India · Runs in your browser
            </span>

            {/* H1 */}
            <h1 className="font-extrabold leading-tight tracking-tight text-ink text-display max-tablet:text-h1 max-mobile:text-36">
              Invoicing as easy
              <br />
              as a{" "}
              <span className="relative inline-block text-coral">
                WhatsApp.
                <HeroUnderline className="block w-full -mt-1 h-3.5 text-coral" aria-hidden="true" />
              </span>
            </h1>

            {/* Sub paragraph */}
            <p className="mt-5 max-w-130 text-19 leading-relaxed text-ink-2 max-tablet:text-17 max-mobile:text-body">
              ArthaPatra is a web app for India&#39;s small shops, home bakers, tailors and traders.
              Open it in any browser, create a bill in 60 seconds, send it on WhatsApp, get paid
              faster.{" "}
              <strong className="font-bold text-ink">
                Free for the first 10 invoices a month.
              </strong>
            </p>

            {/* CTA row */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <PillButton tone="primary" size="lg" render={<Link href="/auth?mode=signup" />}>
                <ArrowRight className="size-5" aria-hidden="true" />
                Open ArthaPatra free
              </PillButton>
              <PillButton tone="outline" size="lg" render={<Link href="#how" />}>
                <PlayCircle className="size-5" aria-hidden="true" />
                See how it works
              </PillButton>
            </div>

            {/* Meta row — consumes HERO_META constant */}
            <div className="mt-7 flex flex-wrap gap-6 text-13 font-semibold text-ink-3">
              {HERO_META.map(({ id, label }) => (
                <span key={id} className="inline-flex items-center gap-1.5">
                  <Check className="size-4 text-paid" aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* ── Right column: browser mock visual ── */}
          {/*
            Stage: full-width on desktop, max-w-180 centred on tablet.
            No aspect-square — the browser mock establishes its own aspect from content.
            HeroFloatingCards positions absolutely relative to this wrapper.
          */}
          <div className="relative w-full max-tablet:max-w-180 max-tablet:mx-auto">
            <HeroBrowserMock />
            <HeroFloatingCards />
          </div>
        </div>
      </div>
    </section>
  );
}

export { Hero };
