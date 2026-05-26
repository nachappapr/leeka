"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Receipt, Sparkles } from "@/components/icons";
import { Avatar, AvatarFallback } from "@/components/ui/primitives/avatar";
import { PillButton } from "@/components/ui/custom/pill-button";
import { NAV_MAIN, NAV_ACCOUNT } from "@/components/ui/custom/sidebar-nav";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 h-screen w-60 max-lg:w-20 max-md:hidden bg-card border-r border-border flex flex-col gap-4 p-3.5 overflow-y-auto">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 py-1">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-nav-item bg-coral shadow-coral">
          <Receipt className="size-5 text-white" aria-hidden />
        </div>
        <div className="max-lg:hidden">
          <div className="text-19 font-black tracking-snug text-ink">Lekka</div>
          <div className="text-11 font-semibold tracking-wide text-ink-3">
            Invoicing
          </div>
        </div>
      </div>

      {/* MAIN section */}
      <div className="flex flex-col gap-0.5">
        <div className="mb-1 px-3 text-kicker uppercase text-ink-3 max-lg:hidden">
          Main
        </div>
        <nav aria-label="Main navigation" className="flex flex-col gap-0.5">
          {NAV_MAIN.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-3 rounded-nav-item px-3 py-2.5 text-body-sm font-semibold transition-colors",
                  isActive
                    ? "bg-coral-soft text-coral-ink"
                    : "text-ink-2 hover:bg-background hover:text-ink",
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0",
                    isActive ? "text-coral" : "",
                  )}
                  aria-hidden
                />
                <span className="flex-1 max-lg:hidden">{item.label}</span>
                {item.badge != null && (
                  <span className="ml-auto rounded-full bg-overdue px-2 py-px text-11 font-black text-white max-lg:absolute max-lg:-right-1 max-lg:-top-1">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ACCOUNT section */}
      <div className="flex flex-col gap-0.5">
        <div className="mb-1 px-3 text-kicker uppercase text-ink-3 max-lg:hidden">
          Account
        </div>
        <nav aria-label="Account navigation" className="flex flex-col gap-0.5">
          {NAV_ACCOUNT.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-nav-item px-3 py-2.5 text-body-sm font-semibold transition-colors",
                  isActive
                    ? "bg-coral-soft text-coral-ink"
                    : "text-ink-2 hover:bg-background hover:text-ink",
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0",
                    isActive ? "text-coral" : "",
                  )}
                  aria-hidden
                />
                <span className="flex-1 max-lg:hidden">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Upgrade banner */}
      <div className="mt-auto rounded-nav-item bg-linear-to-br from-coral-soft to-cream p-3 text-caption text-ink-2 max-lg:hidden">
        <div className="mb-1 flex items-center gap-1.5 text-caption font-black text-ink">
          <Sparkles className="size-4 text-coral" aria-hidden />
          Upgrade to Pro
        </div>
        <p className="text-label leading-relaxed">
          Unlimited invoices, reminders &amp; reports for ₹99/mo
        </p>
        <PillButton tone="primary" size="sm" className="mt-2.5 w-full">
          See plans
        </PillButton>
      </div>

      {/* User footer */}
      <div className="border-t border-border pt-3 px-2 flex items-center gap-2.5">
        <Avatar size="lg" className="shrink-0">
          <AvatarFallback className="bg-coral text-white text-body-sm font-black tracking-wide">
            RK
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 max-lg:hidden">
          <div className="truncate text-caption font-bold text-ink">
            Raj Kumar Trading
          </div>
          <div className="text-11 text-ink-3">Free plan</div>
        </div>
      </div>
    </aside>
  );
}
