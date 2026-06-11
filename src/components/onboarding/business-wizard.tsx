"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

import { BusinessSchema, type BusinessFormData } from "@/lib/schema/business";
import { createBusiness } from "@/lib/actions/business";
import { INDIA_STATES } from "@/lib/constants/business";
import { Building2, ChevronDown, Check } from "@/components/icons";
import { cn } from "@/lib/utils";

interface BusinessWizardProps {
  prefillName?: string;
}

function fieldWrapClass(hasError: boolean, extra?: string) {
  return cn(
    "flex items-center rounded-xl border-[1.5px] bg-surface px-4 transition-all focus-within:ring-4",
    hasError
      ? "border-overdue focus-within:border-overdue focus-within:ring-overdue/14"
      : "border-line-strong focus-within:border-coral-press focus-within:ring-coral/14",
    extra,
  );
}

// Two distinct IDs ensure React inserts/removes the element rather than patching
// it in place — required for role="alert" to fire reliably in screen readers.
function FieldHint({
  hintId,
  errorId,
  error,
  hint,
}: {
  hintId: string;
  errorId: string;
  error?: string;
  hint: string;
}) {
  if (error) {
    return (
      <p id={errorId} role="alert" className="mb-3 text-body-sm font-semibold text-overdue">
        {error}
      </p>
    );
  }
  return (
    <p id={hintId} className="mb-4 text-caption text-ink-3">
      {hint}
    </p>
  );
}

function BusinessWizard({ prefillName }: BusinessWizardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<BusinessFormData>({
    resolver: standardSchemaResolver(BusinessSchema),
    defaultValues: {
      name: prefillName ?? "",
      address: "",
      stateCode: "",
      gstin: "",
      upiId: "",
    },
  });

  function onSubmit(data: BusinessFormData) {
    startTransition(async () => {
      const result = await createBusiness(data);
      if (!result.ok) {
        setError("root", { message: result.error });
        return;
      }
      router.push("/dashboard");
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-0">
      {/* text-coral-ink: coral at 11px kicker size fails 1.4.3 (2.80:1); coral-ink passes at 12.93:1 */}
      <p className="text-kicker font-extrabold uppercase tracking-widest text-coral-ink">
        One more step
      </p>
      <h1 className="mt-1.5 text-h2 font-extrabold leading-tight tracking-tight text-ink">
        Set up your business
      </h1>
      <p className="mt-2 mb-7 text-body leading-relaxed text-ink-2">
        This goes on your invoices. You can update everything later in Settings.
      </p>

      <label htmlFor="biz-name" className="mb-2 block text-label font-bold text-ink-2">
        Business name{" "}
        <span className="text-overdue" aria-hidden="true">
          *
        </span>
      </label>
      <div className={fieldWrapClass(!!errors.name, "mb-1 h-14 gap-2.5")}>
        <Building2 className="size-5 shrink-0 text-ink-3" aria-hidden="true" />
        <input
          id="biz-name"
          type="text"
          autoComplete="organization"
          placeholder="e.g. Sharma Sweets"
          aria-required="true"
          aria-describedby={errors.name ? "biz-name-error" : undefined}
          aria-invalid={!!errors.name}
          {...register("name")}
          className="min-w-0 flex-1 bg-transparent text-body font-semibold text-ink outline-none placeholder:text-ink-3/50"
        />
      </div>
      {errors.name ? (
        <p
          id="biz-name-error"
          role="alert"
          className="mb-3 text-body-sm font-semibold text-overdue"
        >
          {errors.name.message}
        </p>
      ) : (
        <div className="mb-4" />
      )}

      <label htmlFor="address" className="mb-2 block text-label font-bold text-ink-2">
        Address <span className="text-ink-3 font-medium">(optional)</span>
      </label>
      <div
        className={cn(
          "mb-4 rounded-xl border-[1.5px] bg-surface px-4 py-3 transition-all focus-within:ring-4",
          errors.address
            ? "border-overdue focus-within:border-overdue focus-within:ring-overdue/14"
            : "border-line-strong focus-within:border-coral-press focus-within:ring-coral/14",
        )}
      >
        <textarea
          id="address"
          rows={3}
          placeholder="Street, city, pincode"
          aria-describedby={errors.address ? "address-error" : undefined}
          aria-invalid={!!errors.address}
          {...register("address")}
          className="w-full resize-none bg-transparent text-body font-medium text-ink outline-none placeholder:text-ink-3/50"
        />
      </div>
      {errors.address && (
        <p
          id="address-error"
          role="alert"
          className="-mt-3 mb-3 text-body-sm font-semibold text-overdue"
        >
          {errors.address.message}
        </p>
      )}

      <label htmlFor="state-code" className="mb-2 block text-label font-bold text-ink-2">
        State <span className="text-ink-3 font-medium">(optional)</span>
      </label>
      <div className={fieldWrapClass(!!errors.stateCode, "relative mb-4 h-14")}>
        <select
          id="state-code"
          aria-describedby={errors.stateCode ? "state-code-error" : undefined}
          aria-invalid={!!errors.stateCode}
          {...register("stateCode")}
          className="min-w-0 flex-1 appearance-none bg-transparent text-body font-medium text-ink outline-none"
        >
          <option value="">Select state…</option>
          {INDIA_STATES.map((state) => (
            <option key={state.code} value={state.code}>
              {state.name}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none size-4.5 shrink-0 text-ink-3"
          aria-hidden="true"
        />
      </div>
      {errors.stateCode && (
        <p
          id="state-code-error"
          role="alert"
          className="-mt-3 mb-3 text-body-sm font-semibold text-overdue"
        >
          {errors.stateCode.message}
        </p>
      )}

      <label htmlFor="gstin" className="mb-2 block text-label font-bold text-ink-2">
        GSTIN <span className="text-ink-3 font-medium">(optional)</span>
      </label>
      <div className={fieldWrapClass(!!errors.gstin, "mb-1 h-14")}>
        <input
          id="gstin"
          type="text"
          autoComplete="off"
          placeholder="e.g. 27AAPFU0939F1ZV"
          aria-describedby={errors.gstin ? "gstin-error" : "gstin-hint"}
          aria-invalid={!!errors.gstin}
          {...register("gstin")}
          className="min-w-0 flex-1 bg-transparent font-mono text-body-sm font-medium text-ink outline-none placeholder:font-sans placeholder:text-ink-3/50"
        />
      </div>
      <FieldHint
        hintId="gstin-hint"
        errorId="gstin-error"
        error={errors.gstin?.message}
        hint="15-character GST number (optional)"
      />

      <label htmlFor="upi-id" className="mb-2 block text-label font-bold text-ink-2">
        UPI ID <span className="text-ink-3 font-medium">(optional)</span>
      </label>
      <div className={fieldWrapClass(!!errors.upiId, "mb-1 h-14")}>
        <input
          id="upi-id"
          type="text"
          autoComplete="off"
          placeholder="e.g. yourbiz@oksbi"
          aria-describedby={errors.upiId ? "upi-id-error" : "upi-id-hint"}
          aria-invalid={!!errors.upiId}
          {...register("upiId")}
          className="min-w-0 flex-1 bg-transparent text-body font-medium text-ink outline-none placeholder:text-ink-3/50"
        />
      </div>
      <FieldHint
        hintId="upi-id-hint"
        errorId="upi-id-error"
        error={errors.upiId?.message}
        hint="For UPI pay links on invoices"
      />

      {errors.root && (
        <p role="alert" className="mb-4 text-body-sm font-semibold text-overdue">
          {errors.root.message}
        </p>
      )}

      {/* bg-coral-press: coral (#f46a39) on white = 3.01:1 (fails 1.4.3); coral-press (#d9531f) = 4.03:1 (passes) */}
      <button
        type="submit"
        disabled={isPending}
        className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-coral-press text-body font-bold text-white transition-colors hover:bg-coral-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-ink focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
      >
        {!isPending && <Check className="size-5" aria-hidden="true" />}
        {isPending ? "Saving…" : "Create my business"}
      </button>
    </form>
  );
}

export { BusinessWizard };
