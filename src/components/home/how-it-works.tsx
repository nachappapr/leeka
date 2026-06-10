import { STEPS } from "@/lib/constants/home";
import { StepCard } from "@/components/home/step-card";

function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 py-22 max-tablet:py-16 max-mobile:py-12">
      <div className="mx-auto max-w-7xl px-8 max-mobile:px-5">
        {/* Section head */}
        <div className="mx-auto mb-14 max-w-180 text-center">
          <span className="mb-2.5 inline-block text-12 font-extrabold uppercase tracking-widest text-coral-press">
            How it works
          </span>
          <h2 className="text-44 font-extrabold leading-tight tracking-tight max-mobile:text-32">
            Three clicks, you&apos;re done.
          </h2>
          <p className="mt-3.5 text-18 leading-snug text-ink-2 max-mobile:text-body">
            Most invoices go out in under 60 seconds — even for first-time users.
          </p>
        </div>

        {/* Steps grid */}
        <ol className="grid list-none grid-cols-3 gap-5 p-0 max-tablet:grid-cols-1">
          {STEPS.map((step) => (
            <StepCard key={step.id} step={step} />
          ))}
        </ol>
      </div>
    </section>
  );
}

export { HowItWorks };
