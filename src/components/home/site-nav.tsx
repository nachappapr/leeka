"use client";

import { useRef, useState } from "react";
import Link from "next/link";

import {
  LekkaLogo,
  Menu,
  Plus,
  Globe,
} from "@/components/icons";
import { PillButton } from "@/components/ui/custom/pill-button";
import { MobileDrawer } from "@/components/home/mobile-drawer";

function SiteNav() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <nav className="sticky top-0 z-30 border-b border-border bg-background/85 py-3.5 backdrop-blur-sm backdrop-saturate-150">
        <div className="mx-auto flex max-w-7xl items-center gap-7 px-8 max-mobile:px-5">
          {/* Brand cluster */}
          <Link
            href="/"
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2"
          >
            <div className="flex size-9 items-center justify-center rounded-nav-item bg-coral shadow-coral">
              <LekkaLogo className="size-5" />
            </div>
            <span className="text-20 font-extrabold tracking-tight">
              arthapatra<span className="text-coral">.</span>
            </span>
          </Link>

          {/* Anchor links — same-page, use <a> not <Link> */}
          <div className="ml-4 flex items-center gap-6 max-mobile:hidden">
            <a
              href="#features"
              className="py-1.5 text-body-sm font-semibold text-ink-2 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2 rounded-sm"
            >
              Features
            </a>
            <a
              href="#how"
              className="py-1.5 text-body-sm font-semibold text-ink-2 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2 rounded-sm"
            >
              How it works
            </a>
            <a
              href="#pricing"
              className="py-1.5 text-body-sm font-semibold text-ink-2 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2 rounded-sm"
            >
              Pricing
            </a>
            <a
              href="#faq"
              className="py-1.5 text-body-sm font-semibold text-ink-2 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2 rounded-sm"
            >
              FAQ
            </a>
          </div>

          {/* Right cluster */}
          <div className="ml-auto flex items-center gap-2.5">
            {/* Language chip — hidden on mobile; aria-disabled until picker is wired */}
            <button
              type="button"
              aria-disabled="true"
              aria-label="Language: English / Hindi (selector coming soon)"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-13 font-semibold text-ink-2 transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2 max-mobile:hidden"
            >
              <Globe className="size-3.5" />
              EN / <span lang="hi">हिं</span>
            </button>

            {/* Log in — hidden on mobile */}
            <div className="max-mobile:hidden">
              <PillButton
                tone="outline"
                size="md"
                render={<Link href="/dashboard" />}
              >
                Log in
              </PillButton>
            </div>

            {/* Get started free — visible all sizes, collapses to icon on mobile */}
            <PillButton
              tone="primary"
              size="md"
              render={<Link href="/dashboard" />}
              className="max-mobile:size-10 max-mobile:p-0"
            >
              <Plus className="size-5 min-mobile:hidden" aria-hidden="true" />
              <span className="sr-only min-mobile:not-sr-only">
                Get started free
              </span>
            </PillButton>

            {/* Mobile menu button — only on mobile */}
            <button
              type="button"
              ref={menuTriggerRef}
              aria-label="Open menu"
              aria-expanded={isDrawerOpen}
              aria-controls="mobile-drawer"
              onClick={() => setIsDrawerOpen(true)}
              className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-ink transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2 min-mobile:hidden"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </nav>

      <MobileDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        triggerRef={menuTriggerRef}
      />
    </>
  );
}

export { SiteNav };
