"use client";

import { padTime } from "@/lib/utils/auth-phone";
import { Info, ArrowRight } from "@/components/icons";
import { OtpInput } from "@/components/auth/otp-input";
import { AuthProgressDots } from "@/components/auth/auth-progress-dots";
import type { AuthMode } from "@/components/auth/auth-pill-toggle";

interface AuthOtpStepProps {
  mode: AuthMode;
  phone: string;
  otp: string;
  resend: number;
  onOtpChange: (v: string) => void;
  onChangeNumber: () => void;
  onResend: () => void;
  onSubmit: () => void;
}

function AuthOtpStep({
  mode,
  phone,
  otp,
  resend,
  onOtpChange,
  onChangeNumber,
  onResend,
  onSubmit,
}: AuthOtpStepProps) {
  const isDisabled = otp.length < 6;

  return (
    <div className="flex flex-col gap-0">
      {mode === "signup" && <AuthProgressDots step="otp" />}

      <p className="text-kicker font-extrabold uppercase tracking-widest text-coral">
        {mode === "login" ? "Sign in" : "Verify"}
      </p>

      <h2 className="mt-1.5 text-h2 font-extrabold leading-tight tracking-tight text-ink">
        Enter the code
      </h2>

      <p className="mt-2 mb-6 text-body text-ink-2">
        Sent to <span className="font-bold text-ink">+91 {phone}</span>{" "}
        <button
          type="button"
          onClick={onChangeNumber}
          className="font-bold text-coral hover:text-coral-press focus-visible:outline-none focus-visible:underline"
        >
          Change
        </button>
      </p>

      <OtpInput value={otp} onChange={onOtpChange} />

      <div className="mt-5 flex items-center gap-2.5 rounded-xl bg-coral-soft p-3">
        <Info className="size-4.5 shrink-0 text-coral-ink" aria-hidden="true" />
        <p className="text-caption font-semibold text-coral-ink">
          We&apos;ll detect the SMS automatically on Android &amp; Chrome.
        </p>
      </div>

      <p className="mt-4 text-center text-body-sm text-ink-3">
        {resend > 0 ? (
          <>
            Resend in <span className="font-bold text-ink">00:{padTime(resend)}</span>
          </>
        ) : (
          <button
            type="button"
            onClick={onResend}
            className="font-extrabold text-coral hover:text-coral-press focus-visible:outline-none focus-visible:underline"
          >
            Resend code
          </button>
        )}
      </p>

      <button
        type="button"
        onClick={onSubmit}
        disabled={isDisabled}
        className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-coral text-body font-bold text-white transition-colors hover:bg-coral-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
      >
        Verify &amp; continue
        <ArrowRight className="size-5" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={onChangeNumber}
        className="mt-3 flex h-12 w-full items-center justify-center rounded-full text-body font-bold text-ink-2 transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2"
      >
        Use a different number
      </button>
    </div>
  );
}

export { AuthOtpStep };
