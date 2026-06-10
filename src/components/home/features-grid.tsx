import { FEATURES } from "@/lib/constants/home";
import { FeatureCard } from "@/components/home/feature-card";

function FeaturesGrid() {
  return (
    <section id="features" className="scroll-mt-20 bg-card py-22 max-tablet:py-16 max-mobile:py-12">
      <div className="mx-auto max-w-7xl px-8 max-mobile:px-5">
        {/* Section head */}
        <div className="mx-auto mb-14 max-w-180 text-center">
          <span className="mb-2.5 inline-block text-12 font-extrabold uppercase tracking-widest text-coral-press">
            Everything you need · nothing you don&apos;t
          </span>
          <h2 className="text-44 font-extrabold leading-tight tracking-tight max-mobile:text-32">
            Made for the way you actually do business.
          </h2>
          <p className="mt-3.5 text-18 leading-snug text-ink-2 max-mobile:text-body">
            Not a watered-down version of accounting software. Built ground-up for vendors who chat
            with customers on WhatsApp, take payments in cash and UPI, and don&apos;t have time for
            spreadsheets.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-3 gap-5 max-tablet:grid-cols-2 max-mobile:grid-cols-1">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

export { FeaturesGrid };
