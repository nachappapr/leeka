"use client";

import { type RefObject } from "react";
import { cn } from "@/lib/utils";
import { BIZ_TYPES } from "@/lib/constants/auth";
import type { BizTypeId } from "@/lib/constants/auth";
import { Check, Store, UserRound } from "@/components/icons";
import { AuthProgressDots } from "@/components/auth/auth-progress-dots";

interface AuthProfileStepProps {
  bizName: string;
  yourName: string;
  bizType: BizTypeId | null;
  isPending?: boolean;
  error?: string;
  yourNameRef?: RefObject<HTMLInputElement | null>;
  onBizNameChange: (v: string) => void;
  onYourNameChange: (v: string) => void;
  onBizTypeChange: (v: BizTypeId) => void;
  onSubmit: () => void;
}

function AuthProfileStep({
  bizName,
  yourName,
  bizType,
  isPending = false,
  error,
  yourNameRef,
  onBizNameChange,
  onYourNameChange,
  onBizTypeChange,
  onSubmit,
}: AuthProfileStepProps) {
  const isDisabled = !bizName.trim() || !yourName.trim() || bizType === null || isPending;

  return (
    <div className="flex flex-col gap-0">
      <AuthProgressDots step="profile" />

      <p className="text-kicker font-extrabold uppercase tracking-widest text-coral">Almost done</p>

      <h2 className="mt-1.5 text-h2 font-extrabold leading-tight tracking-tight text-ink">
        Tell us about your business
      </h2>

      <p className="mt-2 mb-7 text-body leading-relaxed text-ink-2">
        We&apos;ll use this to brand your invoices. You can change anything later in Settings.
      </p>

      <label htmlFor="biz-name" className="mb-2 block text-label font-bold text-ink-2">
        Business name
      </label>
      <div className="mb-4 flex h-14 items-center gap-2.5 rounded-xl border-[1.5px] border-line-strong bg-surface px-4 transition-all focus-within:border-coral focus-within:ring-4 focus-within:ring-coral/14">
        <Store className="size-5 shrink-0 text-ink-3" aria-hidden="true" />
        <input
          id="biz-name"
          type="text"
          autoComplete="organization"
          placeholder="e.g. Sharma Sweets"
          value={bizName}
          onChange={(e) => onBizNameChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-body font-semibold text-ink outline-none placeholder:text-ink-3/50"
        />
      </div>

      <label htmlFor="your-name" className="mb-2 block text-label font-bold text-ink-2">
        Your name
      </label>
      <div className="mb-6 flex h-14 items-center gap-2.5 rounded-xl border-[1.5px] border-line-strong bg-surface px-4 transition-all focus-within:border-coral focus-within:ring-4 focus-within:ring-coral/14">
        <UserRound className="size-5 shrink-0 text-ink-3" aria-hidden="true" />
        <input
          id="your-name"
          ref={yourNameRef}
          type="text"
          autoComplete="name"
          placeholder="e.g. Ramesh Sharma"
          value={yourName}
          onChange={(e) => onYourNameChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-body font-semibold text-ink outline-none placeholder:text-ink-3/50"
        />
      </div>

      <p id="biz-type-label" className="mb-3 text-label font-bold text-ink-2">
        What do you sell?
      </p>
      <div role="group" aria-labelledby="biz-type-label" className="mb-6 grid grid-cols-2 gap-2.5">
        {BIZ_TYPES.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onBizTypeChange(id)}
            aria-pressed={bizType === id}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border-[1.5px] p-3.5 text-caption font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2",
              bizType === id
                ? "border-coral bg-coral-soft text-coral-ink"
                : "border-line bg-surface text-ink-2 hover:border-line-strong hover:bg-surface-2",
            )}
          >
            <Icon className="size-4.5 shrink-0" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mb-3 text-body-sm font-semibold text-overdue">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={isDisabled}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-coral text-body font-bold text-white transition-colors hover:bg-coral-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
      >
        {!isPending && <Check className="size-5" aria-hidden="true" />}
        {isPending ? "Saving…" : "Finish & open ArthaPatra"}
      </button>
    </div>
  );
}

export { AuthProfileStep };
