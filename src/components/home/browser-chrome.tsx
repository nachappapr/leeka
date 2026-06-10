import type React from "react";
import { Lock } from "@/components/icons";
import { cn } from "@/lib/utils";

interface BrowserChromeProps {
  host: string;
  path: string;
  leadingIcon?: React.ReactNode;
  pathTone?: "ink" | "overdue";
}

function BrowserChrome({ host, path, leadingIcon, pathTone = "ink" }: BrowserChromeProps) {
  return (
    <div className="flex items-center gap-3 h-9.5 px-3.5 bg-surface-2 border-b border-border">
      <svg
        width="33"
        height="11"
        viewBox="0 0 33 11"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <circle cx="5.5" cy="5.5" r="5.5" fill="#ED6A5E" />
        <circle cx="16.5" cy="5.5" r="5.5" fill="#F4BF50" />
        <circle cx="27.5" cy="5.5" r="5.5" fill="#61C554" />
      </svg>

      <div className="flex flex-1 items-center gap-2 h-6 px-3 bg-card rounded-lg text-12 font-semibold text-ink-2 border border-border/50">
        {leadingIcon ?? (
          <Lock className="size-2.5 text-paid shrink-0" strokeWidth={2.4} aria-hidden="true" />
        )}
        <span className="text-ink-3">{host}</span>
        <span className={cn(pathTone === "overdue" ? "text-overdue font-bold" : "text-ink")}>
          {path}
        </span>
      </div>
    </div>
  );
}

export { BrowserChrome };
