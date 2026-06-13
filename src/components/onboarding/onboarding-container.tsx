import { redirect } from "next/navigation";

import { getBusinessForUser } from "@/lib/data/business";
import { getProfile } from "@/lib/data/profile";
import { OnboardingClient } from "@/components/onboarding/onboarding-client";

interface OnboardingContainerProps {
  prefillName?: string;
}

async function OnboardingContainer({ prefillName }: OnboardingContainerProps) {
  // Auth is already guaranteed by the proxy for /onboarding, so we never bounce
  // to /auth here — doing so would loop against the proxy's authed→/dashboard
  // guard for accounts that have a session but no business yet.
  const [business, profile] = await Promise.all([getBusinessForUser(), getProfile()]);

  if (business) {
    redirect("/dashboard");
  }

  const displayName = profile?.display_name ?? null;

  return (
    <main>
      <OnboardingClient prefillName={prefillName} displayName={displayName} />
    </main>
  );
}

export { OnboardingContainer };
