import type { Metadata } from "next"

import { AuthContainer } from "@/components/auth/auth-container"
import type { AuthMode } from "@/components/auth/auth-pill-toggle"

export const metadata: Metadata = {
  title: "Sign in — ArthaPatra",
  description: "Log in or create your ArthaPatra account.",
}

interface AuthPageProps {
  searchParams: Promise<{ mode?: string }>
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const { mode } = await searchParams
  const authMode: AuthMode = mode === "signup" ? "signup" : "login"

  return <AuthContainer mode={authMode} />
}
