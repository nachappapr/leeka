"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Loader2, Sparkles } from "@/components/icons";
import { PillButton } from "@/components/ui/custom/pill-button";
import { brandToast } from "@/components/ui/custom/brand-toast";
import { createSubscription } from "@/app/(app)/settings/billing-actions";
import type { RazorpayCheckoutOptions } from "@/lib/types/razorpay";
import { cn } from "@/lib/utils";

interface UpgradeButtonProps {
  children?: React.ReactNode;
  tone?: "primary" | "secondary" | "outline" | "onCoral";
  size?: "sm" | "md" | "lg";
  className?: string;
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window.Razorpay !== "undefined") {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function UpgradeButton({
  children = "Upgrade now",
  tone = "primary",
  size = "md",
  className,
}: UpgradeButtonProps) {
  const router = useRouter();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isPending, startTransition] = useTransition();
  const [isActivating, startActivatingTransition] = useTransition();

  const isLoading = isPending || isActivating;

  function handleUpgrade() {
    startTransition(async () => {
      const result = await createSubscription();

      if (!result.ok) {
        brandToast.warn({
          title: "Upgrade coming soon",
          sub: result.error,
        });
        return;
      }

      const { subscriptionId, razorpayKeyId } = result;

      try {
        await loadRazorpayScript();
      } catch {
        brandToast.warn({
          title: "Upgrade coming soon",
          sub: "Billing is not yet available in your region. We'll notify you when it's ready.",
        });
        return;
      }

      if (typeof window.Razorpay === "undefined") {
        brandToast.warn({
          title: "Upgrade coming soon",
          sub: "Billing is not yet available. Please try again later.",
        });
        return;
      }

      const options: RazorpayCheckoutOptions = {
        key: razorpayKeyId,
        subscription_id: subscriptionId,
        name: "ArthaPatra",
        description: "Pro Plan — ₹99/month",
        handler: () => {
          brandToast.success({
            title: "Upgrade is activating",
            sub: "Your Pro features will unlock shortly once payment is confirmed.",
            duration: 8000,
          });
          triggerRef.current?.focus();
          startActivatingTransition(() => {
            router.refresh();
          });
        },
        modal: {
          ondismiss: () => {
            brandToast.warn({
              title: "Upgrade cancelled",
              sub: "You can upgrade any time from Settings → Plan.",
            });
            triggerRef.current?.focus();
          },
        },
        theme: {
          color: "#F46A39",
        },
      };

      const checkout = new window.Razorpay(options);
      checkout.open();
    });
  }

  const liveMessage = isActivating
    ? "Upgrade is activating — your Pro features will unlock shortly."
    : isPending
      ? "Opening checkout…"
      : "";

  return (
    <>
      <PillButton
        ref={triggerRef}
        type="button"
        tone={tone}
        size={size}
        className={cn(className)}
        disabled={isLoading}
        aria-busy={isLoading}
        aria-label={
          isActivating
            ? "Upgrade is activating — your Pro features will unlock shortly"
            : isLoading
              ? "Opening checkout…"
              : undefined
        }
        onClick={handleUpgrade}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden />
            {isActivating ? "Activating…" : "Opening checkout…"}
          </>
        ) : (
          <>
            <Sparkles aria-hidden />
            {children}
          </>
        )}
      </PillButton>
      <span role="status" aria-live="polite" className="sr-only">
        {liveMessage}
      </span>
    </>
  );
}
