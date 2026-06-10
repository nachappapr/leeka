import type { Feature } from "@/lib/types/home";

function FeatureCard({ feature }: { feature: Feature }) {
  const { icon: Icon, title, description, tone } = feature;

  if (tone === "lg") {
    return (
      <article className="col-span-2 max-mobile:col-span-1 rounded-2xl bg-linear-to-br from-ink to-draft-ink px-6 pt-7 pb-6 text-card">
        <div className="mb-4.5 flex size-12 items-center justify-center rounded-xl bg-coral/20 text-coral">
          <Icon className="size-6" aria-hidden="true" />
        </div>
        <h3 className="text-19 font-extrabold text-card">{title}</h3>
        <p className="mt-2 text-15 leading-relaxed text-card/70">{description}</p>
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-border bg-background px-6 pt-7 pb-6">
      <div className="mb-4.5 flex size-12 items-center justify-center rounded-xl bg-coral-soft text-coral-press">
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <h3 className="text-19 font-extrabold">{title}</h3>
      <p className="mt-2 text-15 leading-relaxed text-ink-2">{description}</p>
    </article>
  );
}

export { FeatureCard };
