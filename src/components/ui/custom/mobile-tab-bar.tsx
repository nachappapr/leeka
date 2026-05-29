"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MOBILE_TABS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-border bg-card p-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] min-mobile:hidden"
    >
      {MOBILE_TABS.map((tab) => {
        if (tab.isPrimary) {
          return (
            <Link
              key="new"
              href={tab.href}
              aria-label="New invoice"
              className="-mt-4 mx-auto flex h-14 w-14 items-center justify-center self-center rounded-full bg-coral shadow-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2"
            >
              <tab.icon className="size-6.5 text-white" strokeWidth={2.4} aria-hidden />
            </Link>
          );
        }

        const isActive =
          pathname === tab.href || pathname.startsWith(`${tab.href}/`);

        return (
          <Link
            key={tab.label}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 px-1 py-2 text-11 font-bold tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
              isActive ? "text-coral-press" : "text-ink-3",
            )}
          >
            <tab.icon className="size-5.5" strokeWidth={isActive ? 2.2 : 1.7} aria-hidden />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
