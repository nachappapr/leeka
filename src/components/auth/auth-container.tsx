import { Suspense } from "react";

import { AuthMarketingPanel } from "@/components/auth/auth-marketing-panel";
import { AuthFormPanel } from "@/components/auth/auth-form-panel";
import { AuthFormSection } from "@/components/auth/auth-form-section";

interface AuthContainerProps {
  searchParams: Promise<{ mode?: string }>;
}

function AuthContainer({ searchParams }: AuthContainerProps) {
  return (
    // Desktop: 2-col grid | Tablet: block with full-page gradient | Mobile: single-col grid, no bg
    <main
      className="grid min-h-screen grid-cols-[1.1fr_1fr] max-tablet:block max-tablet:min-h-screen max-tablet:px-12 max-tablet:py-10 max-tablet:[background:radial-gradient(120%_80%_at_0%_0%,rgba(255,255,255,0.10)_0%,transparent_60%),radial-gradient(80%_60%_at_100%_100%,rgba(0,0,0,0.18)_0%,transparent_60%),linear-gradient(160deg,#F46A39_0%,#E94A1F_55%,#B83A14_100%)] max-mobile:grid max-mobile:grid-cols-1 max-mobile:p-0 max-mobile:[background:none]"
      aria-label="Sign in or create account"
    >
      <AuthMarketingPanel />
      <Suspense fallback={<AuthFormPanel mode="login" />}>
        <AuthFormSection searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

export { AuthContainer };
