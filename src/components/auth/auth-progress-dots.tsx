import { cn } from "@/lib/utils";
import type { AuthStep } from "@/lib/types/auth";

interface AuthProgressDotsProps {
  step: AuthStep;
}

function AuthProgressDots({ step }: AuthProgressDotsProps) {
  const steps: AuthStep[] = ["phone", "otp", "profile"];
  const active = steps.indexOf(step);

  return (
    <div className="mb-6 flex items-center gap-2" aria-label={`Step ${active + 1} of 3`}>
      {steps.map((s, i) => (
        <span
          key={s}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            i < active
              ? "w-2 rounded-full bg-coral opacity-40"
              : i === active
                ? "w-6 rounded-sm bg-coral"
                : "w-2 rounded-full bg-line-strong",
          )}
          aria-hidden="true"
        />
      ))}
      <span className="ml-1 text-label font-bold text-ink-3">Step {active + 1} of 3</span>
    </div>
  );
}

export { AuthProgressDots };
