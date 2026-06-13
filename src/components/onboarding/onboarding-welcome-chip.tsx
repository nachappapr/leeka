import { RotateCcw } from "@/components/icons";

interface OnboardingWelcomeChipProps {
  displayName?: string | null;
}

function OnboardingWelcomeChip({ displayName }: OnboardingWelcomeChipProps) {
  if (!displayName) return null;

  return (
    <div className="mb-6 flex items-center gap-2.5 rounded-xl bg-coral-soft px-3.5 py-3 text-caption font-semibold leading-snug text-coral-ink">
      <RotateCcw className="size-4.5 shrink-0 text-coral" aria-hidden="true" />
      <span>
        Welcome back, <strong className="font-extrabold">{displayName}</strong>. Your number&apos;s
        verified — finish setting up to start sending invoices.
      </span>
    </div>
  );
}

export { OnboardingWelcomeChip };
