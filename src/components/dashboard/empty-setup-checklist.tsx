import Link from "next/link";
import { Check, ChevronRight } from "@/components/icons";
import { cn } from "@/lib/utils";
import { pillButtonVariants } from "@/components/ui/custom/pill-button";
import { SETUP_STEPS } from "@/lib/constants/empty-dashboard";
import type { SetupStep } from "@/lib/types/empty-dashboard";

interface EmptySetupChecklistProps {
  hasCustomers: boolean;
}

export function EmptySetupChecklist({ hasCustomers }: EmptySetupChecklistProps) {
  const steps: ReadonlyArray<SetupStep> = SETUP_STEPS.map((step) => {
    if (step.key === "customer" && hasCustomers) {
      return { ...step, done: true, action: null };
    }
    return step;
  });

  const completedCount = steps.filter((s) => s.done).length;
  const pct = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="rounded-xl bg-card p-6 shadow-card">
      <div className="mb-5 flex items-start justify-between gap-4 max-mobile:flex-col max-mobile:gap-3">
        <div>
          <p className="text-kicker font-extrabold uppercase tracking-wider text-coral">
            Get started
          </p>
          <h2 className="mt-1.5 text-title font-extrabold tracking-snug text-ink">
            Four steps to your first paid invoice
          </h2>
        </div>

        <div
          className="min-w-40 max-mobile:w-full"
          role="img"
          aria-label={`${completedCount} of ${steps.length} complete`}
        >
          <div className="h-1.5 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-coral transition-[width]"
              // eslint-disable-next-line no-restricted-syntax -- progress-fill width is data-driven (pct value); cannot use a static utility
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1.5 text-right text-label text-ink-3 max-mobile:text-left">
            <strong className="font-extrabold text-ink">{completedCount}</strong> of {steps.length}
          </p>
        </div>
      </div>

      <ol className="flex flex-col gap-2.5">
        {steps.map((step, i) => (
          <li
            key={step.key}
            aria-label={step.done ? `${step.label}, completed` : undefined}
            className={cn(
              "flex items-center gap-3.5 rounded-md border p-4 transition-colors max-mobile:flex-wrap max-mobile:gap-3 max-mobile:p-3.5",
              step.done
                ? "border-line bg-card"
                : "border-line bg-cream hover:border-line-strong hover:bg-surface-2",
            )}
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full text-body font-extrabold max-mobile:size-8",
                step.done
                  ? "border-paid bg-paid text-white"
                  : "border-2 border-line-strong bg-surface text-ink-2",
              )}
            >
              {step.done ? <Check className="size-4.5" aria-hidden /> : <span>{i + 1}</span>}
            </span>

            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-body font-bold leading-snug text-ink",
                  step.done && "text-ink-2 line-through decoration-line-strong decoration-[1.5px]",
                )}
              >
                {step.label}
              </p>
              <p className="mt-0.5 text-caption font-medium leading-normal text-ink-3">
                {step.hint}
              </p>
            </div>

            {step.action && (
              <Link
                href={step.action.href}
                className={cn(
                  pillButtonVariants({
                    tone: step.action.primary ? "primary" : "outline",
                    size: "sm",
                  }),
                  "max-mobile:ml-12 max-mobile:shrink max-mobile:basis-full max-mobile:justify-center",
                )}
              >
                {step.action.label}
                {!step.done && <ChevronRight className="size-3.5" aria-hidden />}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
