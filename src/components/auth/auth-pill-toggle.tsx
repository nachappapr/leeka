"use client";

import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

type AuthMode = "login" | "signup";

interface AuthPillToggleProps {
  mode: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
}

function AuthPillToggle({ mode, onModeChange }: AuthPillToggleProps) {
  const router = useRouter();

  function handleSelect(selected: AuthMode) {
    if (selected === mode) return;
    if (onModeChange) {
      onModeChange(selected);
    } else {
      if (selected === "signup") {
        router.replace("/auth?mode=signup");
      } else {
        router.replace("/auth");
      }
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Authentication mode"
      className="relative grid grid-cols-2 rounded-full border border-line bg-surface p-1"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === "login"}
        onClick={() => handleSelect("login")}
        className={cn(
          "h-10 rounded-full text-body-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2",
          mode === "login"
            ? "bg-coral text-white [box-shadow:0_2px_6px_rgba(244,106,57,0.4)]"
            : "bg-transparent text-ink-3 hover:text-ink-2",
        )}
      >
        Sign in
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "signup"}
        onClick={() => handleSelect("signup")}
        className={cn(
          "h-10 rounded-full text-body-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2",
          mode === "signup"
            ? "bg-coral text-white [box-shadow:0_2px_6px_rgba(244,106,57,0.4)]"
            : "bg-transparent text-ink-3 hover:text-ink-2",
        )}
      >
        Create account
      </button>
    </div>
  );
}

export { AuthPillToggle };
export type { AuthMode };
