"use client";

import { Menu } from "@/components/icons";
import { useSidebar } from "@/components/ui/primitives/sidebar";

export function MobileMenuButton() {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      type="button"
      aria-label="Open menu"
      onClick={toggleSidebar}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-ink-2 md:hidden"
    >
      <Menu className="size-5" aria-hidden />
    </button>
  );
}
