import { OnboardingContainer } from "@/components/onboarding/onboarding-container";

interface Props {
  searchParams: Promise<{ name?: string }>;
}

export default async function OnboardingPage({ searchParams }: Props) {
  const { name } = await searchParams;
  return <OnboardingContainer prefillName={name} />;
}
