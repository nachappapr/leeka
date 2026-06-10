import { PRICING_PLANS } from "@/lib/constants/home";
import { PricingPlanCard } from "@/components/home/pricing-plan";

function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-20 bg-card py-22 max-tablet:py-16 max-mobile:py-12">
      <div className="mx-auto max-w-7xl px-8 max-mobile:px-5">
        {/* Section head */}
        <div className="mx-auto mb-14 max-w-180 text-center max-mobile:mb-10">
          <span className="mb-2.5 inline-block text-12 font-extrabold uppercase tracking-widest text-coral-press">
            Pricing
          </span>
          <h2 className="text-44 font-extrabold leading-tight tracking-tight max-mobile:text-32">
            Free to start. Honest when you grow.
          </h2>
          <p className="mt-3.5 text-18 leading-snug text-ink-2 max-mobile:text-body">
            No &ldquo;first month free&rdquo; tricks. No hidden fees. Cancel anytime&nbsp;&mdash;
            we&rsquo;ll never charge without telling you first.
          </p>
        </div>

        {/* Plan grid */}
        <div className="mx-auto grid max-w-220 grid-cols-2 gap-5 max-mobile:grid-cols-1">
          {PRICING_PLANS.map((plan) => (
            <PricingPlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}

export { Pricing };
