import React from "react";

import { cn } from "@/lib/utils";

type PayCardElement = "div" | "section" | "header" | "article" | "aside" | "main";

export interface PayCardProps {
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  headingLevel?: 2 | 3;
  as?: PayCardElement;
  "aria-label"?: string;
}

export function PayCard({
  title,
  children,
  action,
  className,
  headingLevel = 2,
  as: Root = "div",
  "aria-label": ariaLabel,
}: PayCardProps) {
  const Heading = `h${headingLevel}` as "h2" | "h3";
  return (
    <Root
      aria-label={ariaLabel}
      className={cn("flex flex-col rounded-xl bg-card shadow-card overflow-hidden", className)}
    >
      {title || action ? (
        <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-4">
          {title ? (
            <Heading className="text-title-sm font-extrabold text-ink">{title}</Heading>
          ) : null}
          {action}
        </div>
      ) : null}
      {children}
    </Root>
  );
}
