"use client";

import { useState, useEffect, useCallback, useTransition, useRef } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";

import { validPhone } from "@/lib/utils/auth-phone";
import { sendOtp, verifyOtp } from "@/lib/actions/auth";
import { saveDisplayName } from "@/lib/actions/profile";
import { ProfileStepSchema } from "@/lib/schema/profile";
import type { BizTypeId } from "@/lib/constants/auth";
import type { AuthStep } from "@/lib/types/auth";
import { AuthPhoneStep } from "@/components/auth/auth-phone-step";
import { AuthOtpStep } from "@/components/auth/auth-otp-step";
import { AuthProfileStep } from "@/components/auth/auth-profile-step";
import { AuthDoneStep } from "@/components/auth/auth-done-step";
import type { AuthMode } from "@/components/auth/auth-pill-toggle";

interface AuthPhoneFlowProps {
  mode: AuthMode;
}

function AuthPhoneFlow({ mode: initialMode }: AuthPhoneFlowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState<AuthStep>("phone");
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [consent, setConsent] = useState(true);
  const [bizName, setBizName] = useState("");
  const [yourName, setYourName] = useState("");
  const [bizType, setBizType] = useState<BizTypeId | null>(null);
  const [resend, setResend] = useState(0);
  const [phoneError, setPhoneError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const yourNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (resend <= 0) return;
    const id = setInterval(() => {
      setResend((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [resend]);

  useEffect(() => {
    if (step !== "done") return;
    const id = setTimeout(() => {
      router.push("/dashboard");
    }, 900);
    return () => clearTimeout(id);
  }, [step, router]);

  const handleModeChange = useCallback(
    (m: AuthMode) => {
      setMode(m);
      setStep("phone");
      setOtp("");
      setPhoneError("");
      setOtpError("");
      setBizName("");
      setYourName("");
      setBizType(null);
      router.replace(m === "signup" ? "/auth?mode=signup" : "/auth");
    },
    [router],
  );

  function handlePhoneSubmit() {
    if (!validPhone(phone)) return;
    setPhoneError("");
    startTransition(async () => {
      const result = await sendOtp(phone);
      if (!result.ok) {
        setPhoneError(result.error);
        return;
      }
      setOtp("");
      setOtpError("");
      setResend(24);
      setStatusMessage(`Code sent to +91 ${phone}`);
      setStep("otp");
    });
  }

  function handleOtpSubmit() {
    if (otp.length < 6) return;
    setOtpError("");
    startTransition(async () => {
      const result = await verifyOtp(phone, otp);
      if (!result.ok) {
        setOtpError(result.error);
        return;
      }
      if (result.profileComplete) {
        setStatusMessage("Signing you in…");
        setStep("done");
      } else if (mode === "signup") {
        setStatusMessage("Creating your account…");
        setStep("profile");
      } else {
        setStatusMessage("Signing you in…");
        setStep("done");
      }
    });
  }

  function handleChangeNumber() {
    setStep("phone");
    setOtp("");
    setOtpError("");
  }

  function handleResend() {
    if (resend > 0) return;
    setOtpError("");
    startTransition(async () => {
      const result = await sendOtp(phone);
      if (!result.ok) {
        setOtpError(result.error);
        return;
      }
      setResend(24);
      flushSync(() => setStatusMessage(""));
      setStatusMessage(`Code sent to +91 ${phone}`);
    });
  }

  function handleProfileSubmit() {
    const parsed = ProfileStepSchema.safeParse({ displayName: yourName });
    if (!parsed.success) {
      flushSync(() => setProfileError(""));
      setProfileError(parsed.error.issues[0]?.message ?? "Invalid name");
      yourNameRef.current?.focus();
      return;
    }
    setStatusMessage("Saving…");
    startTransition(async () => {
      const result = await saveDisplayName(parsed.data.displayName);
      if (!result.ok) {
        setProfileError(result.error);
        setStatusMessage("");
        yourNameRef.current?.focus();
        return;
      }
      setStatusMessage("All set! Opening your dashboard…");
      setStep("done");
    });
  }

  return (
    <>
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {statusMessage}
      </p>

      {step === "done" && <AuthDoneStep mode={mode} yourName={yourName} />}

      {step === "profile" && (
        <AuthProfileStep
          bizName={bizName}
          yourName={yourName}
          bizType={bizType}
          isPending={isPending}
          error={profileError}
          yourNameRef={yourNameRef}
          onBizNameChange={setBizName}
          onYourNameChange={setYourName}
          onBizTypeChange={setBizType}
          onSubmit={handleProfileSubmit}
        />
      )}

      {step === "otp" && (
        <AuthOtpStep
          mode={mode}
          phone={phone}
          otp={otp}
          resend={resend}
          isPending={isPending}
          error={otpError}
          onOtpChange={setOtp}
          onChangeNumber={handleChangeNumber}
          onResend={handleResend}
          onSubmit={handleOtpSubmit}
        />
      )}

      {step === "phone" && (
        <AuthPhoneStep
          mode={mode}
          phone={phone}
          consent={consent}
          isPending={isPending}
          error={phoneError}
          onPhoneChange={setPhone}
          onConsentChange={setConsent}
          onModeChange={handleModeChange}
          onSubmit={handlePhoneSubmit}
        />
      )}
    </>
  );
}

export { AuthPhoneFlow };
