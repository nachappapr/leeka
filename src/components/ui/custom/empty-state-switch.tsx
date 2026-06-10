"use client";

import type { ReactNode } from "react";
import { useEmptyState } from "@/components/ui/custom/empty-state-provider";

interface EmptyStateSwitchProps {
  empty: ReactNode;
  populated: ReactNode;
}

export function EmptyStateSwitch({ empty, populated }: EmptyStateSwitchProps) {
  const { isEmpty } = useEmptyState();
  return (
    <>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {isEmpty ? "Showing empty state preview" : "Showing your data"}
      </span>
      {isEmpty ? empty : populated}
    </>
  );
}
