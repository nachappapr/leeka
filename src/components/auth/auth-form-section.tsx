import { AuthFormPanel } from "@/components/auth/auth-form-panel";
import type { AuthMode } from "@/components/auth/auth-pill-toggle";

interface AuthFormSectionProps {
  searchParams: Promise<{ mode?: string }>;
}

export async function AuthFormSection({ searchParams }: AuthFormSectionProps) {
  const { mode } = await searchParams;
  const authMode: AuthMode = mode === "signup" ? "signup" : "login";
  return <AuthFormPanel mode={authMode} />;
}
