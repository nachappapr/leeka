import { redirect } from "next/navigation";

import { getProfile } from "@/lib/data/profile";
import { getBusinessForUser } from "@/lib/data/business";
import { BusinessWizard } from "@/components/onboarding/business-wizard";

interface OnboardingContainerProps {
  prefillName?: string;
}

async function OnboardingContainer({ prefillName }: OnboardingContainerProps) {
  const profile = await getProfile();

  if (!profile) {
    redirect("/auth");
  }

  const business = await getBusinessForUser();

  if (business) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-110">
        <BusinessWizard prefillName={prefillName} />
      </div>
    </main>
  );
}

export { OnboardingContainer };
