"use client";

import { useId } from "react";
import type React from "react";
import Link from "next/link";

import { SheetClose } from "@/components/ui/primitives/sheet";

interface SheetActionItemProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  disabledHint?: string;
}

const ROW_CLASS =
  "flex w-full items-center gap-3.5 px-5.5 py-3.5 text-left text-body font-semibold text-ink transition-colors active:bg-background hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-coral-press";
const ICON_CLASS =
  "flex size-9 shrink-0 items-center justify-center rounded-nav-item bg-background text-ink-2";

// A disabled row stays in the tab order (aria-disabled, not the native disabled
// attribute) so its describedby hint is announced; enabled rows close the sheet
// via SheetClose, and link rows navigate.
export function SheetActionItem({
  icon,
  label,
  href,
  onClick,
  disabled,
  disabledHint,
}: SheetActionItemProps) {
  const hintId = useId();

  if (disabled) {
    return (
      <div className="px-5.5">
        <button
          type="button"
          aria-disabled
          aria-describedby={disabledHint ? hintId : undefined}
          onClick={(event) => event.preventDefault()}
          className="flex w-full cursor-not-allowed items-center gap-3.5 py-3.5 text-left text-body font-semibold text-ink-3 opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-coral-press"
        >
          <span className={ICON_CLASS}>{icon}</span>
          {label}
        </button>
        {disabledHint && (
          <p id={hintId} className="mt-1 pl-12 text-label text-ink-3">
            {disabledHint}
          </p>
        )}
      </div>
    );
  }

  if (href) {
    return (
      <Link href={href} className={ROW_CLASS}>
        <span className={ICON_CLASS}>{icon}</span>
        {label}
      </Link>
    );
  }

  return (
    <SheetClose className={ROW_CLASS} onClick={onClick}>
      <span className={ICON_CLASS}>{icon}</span>
      {label}
    </SheetClose>
  );
}
