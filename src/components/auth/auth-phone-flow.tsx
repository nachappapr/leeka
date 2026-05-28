"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

import { validPhone } from "@/lib/utils/auth-phone"
import type { BizTypeId } from "@/lib/constants/auth"
import type { AuthStep } from "@/lib/types/auth"
import { AuthPhoneStep } from "@/components/auth/auth-phone-step"
import { AuthOtpStep } from "@/components/auth/auth-otp-step"
import { AuthProfileStep } from "@/components/auth/auth-profile-step"
import { AuthDoneStep } from "@/components/auth/auth-done-step"
import type { AuthMode } from "@/components/auth/auth-pill-toggle"

interface AuthPhoneFlowProps {
  mode: AuthMode
}

function AuthPhoneFlow({ mode: initialMode }: AuthPhoneFlowProps) {
  const router = useRouter()

  const [step, setStep] = useState<AuthStep>("phone")
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [consent, setConsent] = useState(true)
  const [bizName, setBizName] = useState("")
  const [yourName, setYourName] = useState("")
  const [bizType, setBizType] = useState<BizTypeId | null>(null)
  const [resend, setResend] = useState(0)

  useEffect(() => {
    if (resend <= 0) return
    const id = setInterval(() => {
      setResend((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [resend])

  useEffect(() => {
    if (step !== "done") return
    const id = setTimeout(() => {
      router.push("/dashboard")
    }, 900)
    return () => clearTimeout(id)
  }, [step, router])

  const handleModeChange = useCallback((m: AuthMode) => {
    setMode(m)
    setStep("phone")
    setOtp("")
    setBizName("")
    setYourName("")
    setBizType(null)
    router.replace(m === "signup" ? "/auth?mode=signup" : "/auth")
  }, [router])

  function handlePhoneSubmit() {
    if (!validPhone(phone)) return
    setStep("otp")
    setOtp("")
    setResend(24)
  }

  function handleOtpSubmit() {
    if (otp.length < 6) return
    setStep(mode === "signup" ? "profile" : "done")
  }

  function handleChangeNumber() {
    setStep("phone")
    setOtp("")
  }

  function handleResend() {
    if (resend > 0) return
    setResend(24)
    // TODO: wire resend API
  }

  if (step === "done") {
    return <AuthDoneStep mode={mode} yourName={yourName} />
  }

  if (step === "profile") {
    return (
      <AuthProfileStep
        bizName={bizName}
        yourName={yourName}
        bizType={bizType}
        onBizNameChange={setBizName}
        onYourNameChange={setYourName}
        onBizTypeChange={setBizType}
        onSubmit={() => setStep("done")}
      />
    )
  }

  if (step === "otp") {
    return (
      <AuthOtpStep
        mode={mode}
        phone={phone}
        otp={otp}
        resend={resend}
        onOtpChange={setOtp}
        onChangeNumber={handleChangeNumber}
        onResend={handleResend}
        onSubmit={handleOtpSubmit}
      />
    )
  }

  return (
    <AuthPhoneStep
      mode={mode}
      phone={phone}
      consent={consent}
      onPhoneChange={setPhone}
      onConsentChange={setConsent}
      onModeChange={handleModeChange}
      onSubmit={handlePhoneSubmit}
    />
  )
}

export { AuthPhoneFlow }
