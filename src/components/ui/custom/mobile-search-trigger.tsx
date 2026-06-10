"use client";

import { useState } from "react";

import { Search } from "@/components/icons";
import { MobileSearchSheet } from "@/components/ui/custom/mobile-search-sheet";

export function MobileSearchTrigger() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-ink-2 transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1 min-mobile:hidden"
        onClick={() => setOpen(true)}
        aria-label="Search"
        aria-haspopup="dialog"
      >
        <Search className="size-5" aria-hidden />
      </button>
      <MobileSearchSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
