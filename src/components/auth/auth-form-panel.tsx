import Link from "next/link";

import { ChevronLeft } from "@/components/icons";
import { AuthPhoneFlow } from "@/components/auth/auth-phone-flow";
import type { AuthMode } from "@/components/auth/auth-pill-toggle";

interface AuthFormPanelProps {
  mode: AuthMode;
}

function AuthFormPanel({ mode }: AuthFormPanelProps) {
  return (
    // Desktop: plain right panel | Tablet: floating white card on gradient | Mobile: flat stacked panel
    <div className="flex min-h-screen flex-col bg-background px-5 py-10 max-tablet:min-h-0 max-tablet:mx-auto max-tablet:mt-7 max-tablet:max-w-155 max-tablet:rounded-2xl max-tablet:pt-9 max-tablet:px-11 max-tablet:pb-10 max-tablet:[box-shadow:0_30px_70px_rgba(40,15,4,0.32),0_10px_24px_rgba(40,15,4,0.18)] max-mobile:rounded-none max-mobile:shadow-none max-mobile:mx-0 max-mobile:mt-0 max-mobile:max-w-none max-mobile:px-5 max-mobile:py-7">
      {/* Top bar */}
      <div className="mb-8 flex items-center justify-between max-tablet:mb-5.5 max-mobile:mb-4.5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-caption font-bold text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2 max-tablet:text-ink-2"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Home
        </Link>
        <span className="rounded-full border border-line bg-surface px-3 py-1.5 text-label font-bold text-ink-2">
          EN / हिं
        </span>
      </div>

      {/* Form card */}
      <div className="mx-auto w-full max-w-110 my-auto max-tablet:my-0 max-tablet:max-w-none max-mobile:max-w-full">
        <AuthPhoneFlow mode={mode} />
      </div>
    </div>
  );
}

export { AuthFormPanel };
