import type { Metadata } from "next";

import { AuthContainer } from "@/components/auth/auth-container";

export const metadata: Metadata = {
  title: "Sign in — ArthaPatra",
  description: "Log in or create your ArthaPatra account.",
};

interface AuthPageProps {
  searchParams: Promise<{ mode?: string }>;
}

export default function AuthPage({ searchParams }: AuthPageProps) {
  return <AuthContainer searchParams={searchParams} />;
}
