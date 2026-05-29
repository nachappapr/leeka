"use client";

// ArthaPatra brand Toaster — mounts Sonner configured to the brand placement.
//
// Desktop (≥769px): bottom-right at 28px offsets, 380px wide (w-95).
// Mobile (≤768px):  Sonner's built-in responsive behaviour (≤600px) gives us
//                   full-width with side gutter; we extend to 768px by also
//                   providing mobileOffset with the safe-area token for bottom.
//
// Sonner renders its own aria-live region — BrandToaster does not duplicate it.

import { Toaster } from "@/components/ui/primitives/sonner";

export function BrandToaster() {
  return (
    <Toaster
      position="bottom-right"
      duration={5200}
      // Desktop offset: 28px = 7 * 4px
      offset={{ right: 28, bottom: 28 }}
      // Mobile offset: 12px gutter; bottom = tab-bar + safe-area (CSS var)
      mobileOffset={{ left: 12, right: 12, bottom: "var(--spacing-mobile-bar-offset)" }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "w-full",
        },
      }}
      style={
        {
          // 380px = 95 × 4px (Tailwind w-95)
          "--width": "380px",
        } as React.CSSProperties
      }
    />
  );
}
