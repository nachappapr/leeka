import type { Step } from "@/lib/types/home";

function StepCard({ step }: { step: Step }) {
  const { n, title, description, illustration: Illustration } = step;

  return (
    <li className="rounded-2xl border border-border bg-card p-7 text-left">
      {/* Number badge */}
      <div className="mb-4.5 flex size-9 items-center justify-center rounded-full bg-coral text-15 font-extrabold tracking-tight text-card shadow-coral">
        {n}
      </div>

      <h3 className="text-20 font-extrabold">{title}</h3>
      <p className="mt-2 text-body-sm leading-relaxed text-ink-2">{description}</p>

      <Illustration />
    </li>
  );
}

export { StepCard };
