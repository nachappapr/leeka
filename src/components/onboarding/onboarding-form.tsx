"use client";

import type { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";

import { Building2, Check, UserRound } from "@/components/icons";
import { PillButton } from "@/components/ui/custom/pill-button";
import { FieldLabel } from "@/components/ui/custom/field-label";
import { IconInputField } from "@/components/ui/custom/icon-input-field";
import { BusinessTypePicker } from "@/components/onboarding/business-type-picker";
import { OnboardingDetailsPanel } from "@/components/onboarding/onboarding-details-panel";
import { OnboardingTopbar } from "@/components/onboarding/onboarding-topbar";
import { OnboardingWelcomeChip } from "@/components/onboarding/onboarding-welcome-chip";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import type { OnboardingBusinessFormData } from "@/lib/schema/business";
import type { BizTypeId } from "@/lib/constants/auth";

interface OnboardingFormProps {
  displayName?: string | null;
  phone?: string | null;
  register: UseFormRegister<OnboardingBusinessFormData>;
  errors: FieldErrors<OnboardingBusinessFormData>;
  setValue: UseFormSetValue<OnboardingBusinessFormData>;
  selectedType: BizTypeId | undefined;
  selectedState: string;
  isCtaDisabled: boolean;
  isPending: boolean;
  onGstinChange: (val: string) => void;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}

function OnboardingForm({
  displayName,
  phone,
  register,
  errors,
  setValue,
  selectedType,
  selectedState,
  isCtaDisabled,
  isPending,
  onGstinChange,
  onSubmit,
}: OnboardingFormProps) {
  return (
    <section className="flex flex-col px-14 pt-9 pb-12 max-tablet:px-10 max-tablet:pt-8 max-tablet:pb-10 max-mobile:px-6 max-mobile:pt-6 max-mobile:pb-9">
      <div className="mx-auto w-full max-w-120">
        <OnboardingTopbar />
        <OnboardingWelcomeChip displayName={displayName} phone={phone} />
        <OnboardingProgress />

        <p className="text-kicker font-extrabold uppercase tracking-widest text-coral-ink">
          One more step
        </p>
        <h1 className="mt-1.5 text-h2 font-extrabold leading-tight tracking-tight text-ink">
          Set up your business
        </h1>
        <p className="mt-2 mb-7 text-body leading-relaxed text-ink-2">
          This is the header on every invoice you send. Just the basics are required — add the
          invoice details now or anytime in Settings.
        </p>

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-0">
          <div className="mb-7 flex flex-col gap-4">
            <div>
              <FieldLabel htmlFor="ob-biz-name">
                Business name{" "}
                <span className="text-overdue" aria-hidden="true">
                  *
                </span>
              </FieldLabel>
              <IconInputField
                id="ob-biz-name"
                type="text"
                autoComplete="organization"
                placeholder="e.g. Sharma Sweets"
                aria-required="true"
                aria-describedby={errors.name ? "ob-biz-name-error" : undefined}
                aria-invalid={!!errors.name}
                leadingIcon={<Building2 className="size-5" />}
                error={!!errors.name}
                {...register("name")}
              />
              {errors.name && (
                <p
                  id="ob-biz-name-error"
                  role="alert"
                  className="mt-1 text-body-sm font-semibold text-overdue"
                >
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <FieldLabel htmlFor="ob-owner-name">
                Your name{" "}
                <span className="text-overdue" aria-hidden="true">
                  *
                </span>
              </FieldLabel>
              <IconInputField
                id="ob-owner-name"
                type="text"
                autoComplete="name"
                placeholder="e.g. Raj Kumar"
                aria-required="true"
                aria-invalid={!!errors.ownerName}
                aria-describedby={
                  errors.ownerName ? "ob-owner-name-error ob-owner-name-hint" : "ob-owner-name-hint"
                }
                leadingIcon={<UserRound className="size-5" />}
                error={!!errors.ownerName}
                {...register("ownerName")}
              />
              <p id="ob-owner-name-hint" className="mt-2 text-caption text-ink-3">
                The account owner — also the contact on your invoices.
              </p>
              {errors.ownerName && (
                <p
                  id="ob-owner-name-error"
                  role="alert"
                  className="mt-1 text-body-sm font-semibold text-overdue"
                >
                  {errors.ownerName.message}
                </p>
              )}
            </div>

            <div>
              <p id="ob-biz-type-label" className="mb-1.5 text-label font-bold text-ink-2">
                Business type{" "}
                <span className="text-overdue" aria-hidden="true">
                  *
                </span>
              </p>
              <span id="ob-biz-type-req" className="sr-only">
                Required
              </span>
              <BusinessTypePicker
                value={selectedType}
                onChange={(id) => setValue("businessType", id, { shouldValidate: true })}
                describedBy={
                  errors.businessType ? "ob-biz-type-req ob-biz-type-error" : "ob-biz-type-req"
                }
              />
              {errors.businessType && (
                <p
                  id="ob-biz-type-error"
                  role="alert"
                  className="mt-1 text-body-sm font-semibold text-overdue"
                >
                  {errors.businessType.message}
                </p>
              )}
            </div>
          </div>

          <div className="mb-7">
            <div className="mb-3.5 flex items-baseline justify-between">
              <span className="text-label font-extrabold uppercase tracking-wider text-ink-3">
                Invoice details
              </span>
              <span className="text-caption font-semibold text-ink-3">
                Optional · improves every invoice
              </span>
            </div>
            <OnboardingDetailsPanel
              register={register}
              errors={errors}
              selectedState={selectedState}
              onStateChange={(v) => setValue("stateCode", v, { shouldValidate: true })}
              onGstinChange={onGstinChange}
            />
          </div>

          {errors.root && (
            <p role="alert" className="mb-4 text-body-sm font-semibold text-overdue">
              {errors.root.message}
            </p>
          )}

          <div className="mt-8">
            <PillButton
              type="submit"
              tone="primary"
              size="lg"
              disabled={isCtaDisabled || isPending}
              className="h-14 w-full bg-coral-press hover:bg-coral-deep"
            >
              {!isPending && <Check className="size-5" aria-hidden="true" />}
              {isPending ? "Creating…" : "Create my business"}
            </PillButton>
          </div>
        </form>
      </div>
    </section>
  );
}

export { OnboardingForm };
