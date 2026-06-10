"use client";

// ArthaPatra brand toast helper — wraps Sonner's toast.custom() to produce the
// dark-ink card design from send-flow.jsx (.sf-toast).
//
// Usage:
//   brandToast.success({ title: "Sent!", sub: "Pay link: rzp.io/… · ₹1,200" })
//   brandToast.warn({ title: "Heads up", actions: [{ label: "Retry", primary: true }] })
//   brandToast.error({ title: "Couldn't send" })

import { toast } from "sonner";
import { Check, Clock, Info, XIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface BrandToastAction {
  label: string;
  icon?: React.ReactNode;
  primary?: boolean;
  onClick?: () => void;
}

export interface BrandToastOptions {
  title: string;
  sub?: string;
  actions?: BrandToastAction[];
  duration?: number;
}

type ToastKind = "success" | "warn" | "error";

// ── Tile bg by kind ───────────────────────────────────────────────────────────
const TILE_CLS: Record<ToastKind, string> = {
  success: "bg-paid",
  warn: "bg-pending",
  error: "bg-overdue",
};

// ── Custom toast body component ───────────────────────────────────────────────
interface BrandToastBodyProps {
  kind: ToastKind;
  title: string;
  sub?: string;
  actions?: BrandToastAction[];
  toastId: string | number;
}

function BrandToastBody({ kind, title, sub, actions, toastId }: BrandToastBodyProps) {
  const Icon = kind === "error" ? Info : kind === "warn" ? Clock : Check;

  return (
    <div
      className={cn(
        "w-full rounded-lg bg-ink p-4 text-card shadow-float",
        "grid items-start gap-y-2.5",
        // 3-column grid: tile | body | close
        "grid-cols-[36px_1fr_auto] gap-x-3.5",
      )}
    >
      {/* Tile — col 1, row 1 */}
      <span
        className={cn(
          "col-start-1 row-start-1 flex size-9 shrink-0 items-center justify-center rounded-md text-card",
          TILE_CLS[kind],
        )}
        aria-hidden
      >
        <Icon className={cn("size-4.5", kind === "success" ? "stroke-[2.8]" : "")} />
      </span>

      {/* Body — col 2, row 1 */}
      <div className="col-start-2 row-start-1 flex flex-col justify-center self-center leading-snug">
        <span className="text-body-sm font-bold text-card">{title}</span>
        {sub && <span className="mt-0.5 text-label font-medium text-card/60">{sub}</span>}
      </div>

      {/* Close — col 3, row 1 */}
      <button
        type="button"
        onClick={() => toast.dismiss(toastId)}
        aria-label="Dismiss notification"
        className={cn(
          "col-start-3 row-start-1 flex size-9 shrink-0 items-center justify-center rounded-sm",
          "text-card/50 transition-colors hover:bg-card/10 hover:text-card",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-card/40",
        )}
      >
        <XIcon className="size-3.5" aria-hidden />
      </button>

      {/* Actions — col 2–3, row 2 (only rendered when present) */}
      {actions && actions.length > 0 && (
        <div className="col-span-2 col-start-2 row-start-2 flex flex-wrap gap-2">
          {actions.map((action, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                action.onClick?.();
                toast.dismiss(toastId);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-sm px-3 py-2.5 text-caption font-bold transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-card/40",
                action.primary
                  ? "bg-card text-coral-ink hover:bg-card/90"
                  : "border border-card/60 bg-transparent text-card hover:bg-card/15",
              )}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── brandToast public API ─────────────────────────────────────────────────────
function fireToast(kind: ToastKind, opts: BrandToastOptions) {
  toast.custom(
    (id) => (
      <BrandToastBody
        kind={kind}
        title={opts.title}
        sub={opts.sub}
        actions={opts.actions}
        toastId={id}
      />
    ),
    { duration: opts.duration },
  );
}

export const brandToast = {
  success: (opts: BrandToastOptions) => fireToast("success", opts),
  warn: (opts: BrandToastOptions) => fireToast("warn", opts),
  error: (opts: BrandToastOptions) => fireToast("error", opts),
};
