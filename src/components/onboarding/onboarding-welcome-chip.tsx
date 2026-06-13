import { RotateCw } from "@/components/icons";
import { formatE164ForDisplay } from "@/lib/utils/auth-phone";

interface OnboardingWelcomeChipProps {
  displayName?: string | null;
  phone?: string | null;
}

function OnboardingWelcomeChip({ displayName, phone }: OnboardingWelcomeChipProps) {
  if (!displayName && !phone) return null;

  return (
    <div className="mb-6 flex items-center gap-2.5 rounded-xl bg-coral-soft px-3.5 py-3 text-caption font-semibold leading-snug text-coral-ink">
      <RotateCw className="size-4.5 shrink-0 text-coral" aria-hidden="true" />
      <span>
        {displayName ? (
          <>
            Welcome back, <strong className="font-extrabold">{displayName}</strong>. Your
            number&apos;s verified — finish setting up to start sending invoices.
          </>
        ) : (
          <>
            Welcome back —{" "}
            <strong className="font-extrabold">{formatE164ForDisplay(phone!)}</strong> is verified.
            Finish setting up to start sending invoices.
          </>
        )}
      </span>
    </div>
  );
}

export { OnboardingWelcomeChip };
