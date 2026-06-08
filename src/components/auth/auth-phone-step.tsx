"use client"

import { cn } from "@/lib/utils"
import { formatPhone, validPhone } from "@/lib/utils/auth-phone"
import { Info, ArrowRight, Check } from "@/components/icons"
import { AuthPillToggle } from "@/components/auth/auth-pill-toggle"
import type { AuthMode } from "@/components/auth/auth-pill-toggle"

interface AuthPhoneStepProps {
  mode: AuthMode
  phone: string
  consent: boolean
  onPhoneChange: (v: string) => void
  onConsentChange: (v: boolean) => void
  onModeChange: (m: AuthMode) => void
  onSubmit: () => void
}

function AuthPhoneStep({
  mode,
  phone,
  consent,
  onPhoneChange,
  onConsentChange,
  onModeChange,
  onSubmit,
}: AuthPhoneStepProps) {
  const isDisabled = !validPhone(phone) || (mode === "signup" && !consent)

  function handlePhoneInput(e: React.ChangeEvent<HTMLInputElement>) {
    onPhoneChange(formatPhone(e.target.value))
  }

  return (
    <div className="flex flex-col gap-0">
      <div className="mb-7">
        <AuthPillToggle mode={mode} onModeChange={onModeChange} />
      </div>

      <p className="text-kicker font-extrabold uppercase tracking-widest text-coral">
        {mode === "login" ? "Welcome back" : "Create account"}
      </p>

      <h2 className="mt-1.5 text-h2 font-extrabold leading-tight tracking-tight text-ink">
        {mode === "login" ? "Sign in with your mobile" : "Let's get you set up"}
      </h2>

      <p className="mb-7 mt-2 text-body leading-relaxed text-ink-2">
        {mode === "login"
          ? "We'll send a 6-digit code to verify it's you."
          : "Just your mobile to start — full setup takes under a minute."}
      </p>

      <label htmlFor="phone-input" className="mb-2 block text-label font-bold text-ink-2">
        Mobile number
      </label>
      <div className="flex h-16 items-center gap-2.5 rounded-xl border-[1.5px] border-line-strong bg-surface px-4 transition-all focus-within:border-coral focus-within:ring-4 focus-within:ring-coral/14">
        <span className="text-22 leading-none" aria-hidden="true">🇮🇳</span>
        <span className="shrink-0 text-18 font-bold text-ink">+91</span>
        <span className="h-7 w-px shrink-0 bg-line" aria-hidden="true" />
        <input
          id="phone-input"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="98765 43210"
          value={phone}
          onChange={handlePhoneInput}
          className="min-w-0 flex-1 bg-transparent text-22 font-bold tracking-wide tabular-nums text-ink outline-none placeholder:text-ink-3/50"
        />
      </div>

      {/* Consent — signup only, animated */}
      <div
        className={cn(
          "overflow-hidden transition-[max-height,opacity] duration-300",
          mode === "signup" ? "max-h-40 opacity-100" : "max-h-0 opacity-0",
        )}
        aria-hidden={mode !== "signup"}
      >
        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <button
            type="button"
            role="checkbox"
            aria-checked={consent}
            onClick={() => onConsentChange(!consent)}
            className={cn(
              "mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded-md border-[1.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2",
              consent ? "border-coral bg-coral" : "border-line-strong bg-surface",
            )}
          >
            {consent && <Check className="size-3.5 text-white" aria-hidden="true" />}
          </button>
          <span className="text-caption leading-relaxed text-ink-2">
            I agree to ArthaPatra&apos;s{" "}
            <span className="font-semibold text-ink">Terms of Service</span> and{" "}
            <span className="font-semibold text-ink">Privacy Policy</span>, and to receive transactional SMS on this number.
          </span>
        </label>
      </div>

      <div className="mt-4 flex items-center gap-2 text-caption text-ink-3">
        <Info className="size-4 shrink-0" aria-hidden="true" />
        <span>We never share your number. SMS rates may apply.</span>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={isDisabled}
        className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-coral text-body font-bold text-white transition-colors hover:bg-coral-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
      >
        {mode === "login" ? "Send code" : "Continue"}
        <ArrowRight className="size-5" aria-hidden="true" />
      </button>

      <p className="mt-5 text-center text-body-sm text-ink-3">
        {mode === "login" ? (
          <>
            New to ArthaPatra?{" "}
            <button
              type="button"
              onClick={() => onModeChange("signup")}
              className="font-extrabold text-coral hover:text-coral-press focus-visible:outline-none focus-visible:underline"
            >
              Create account
            </button>
          </>
        ) : (
          <>
            Already on ArthaPatra?{" "}
            <button
              type="button"
              onClick={() => onModeChange("login")}
              className="font-extrabold text-coral hover:text-coral-press focus-visible:outline-none focus-visible:underline"
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  )
}

export { AuthPhoneStep }
