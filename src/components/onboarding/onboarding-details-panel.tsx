"use client";

import type { UseFormRegister, FieldErrors } from "react-hook-form";

import { MapPin, GstCard, UpiCard } from "@/components/icons";
import { FieldLabel } from "@/components/ui/custom/field-label";
import { IconInputField } from "@/components/ui/custom/icon-input-field";
import { IconTextareaField } from "@/components/ui/custom/icon-textarea-field";
import { BrandSelect } from "@/components/ui/custom/brand-select";
import { INDIA_STATES } from "@/lib/constants/business";
import type { OnboardingBusinessFormData } from "@/lib/schema/business";

const STATE_OPTIONS = INDIA_STATES.map((s) => ({ value: s.code, label: s.name }));

interface OnboardingDetailsPanelProps {
  register: UseFormRegister<OnboardingBusinessFormData>;
  errors: FieldErrors<OnboardingBusinessFormData>;
  selectedState: string;
  onStateChange: (v: string) => void;
  onGstinChange: (val: string) => void;
}

function OnboardingDetailsPanel({
  register,
  errors,
  selectedState,
  onStateChange,
  onGstinChange,
}: OnboardingDetailsPanelProps) {
  const gstinProps = register("gstin");

  return (
    <div className="rounded-2xl border border-line bg-surface-2 p-5">
      <div className="flex flex-col gap-4">
        <div>
          <FieldLabel htmlFor="ob-address">
            Address <span className="font-semibold text-ink-3">(optional)</span>
          </FieldLabel>
          <IconTextareaField
            id="ob-address"
            rows={2}
            placeholder="Street, city, pincode"
            aria-describedby={errors.address ? "ob-address-error" : undefined}
            aria-invalid={!!errors.address}
            leadingIcon={<MapPin className="size-5" />}
            error={!!errors.address}
            {...register("address")}
          />
          {errors.address && (
            <p
              id="ob-address-error"
              role="alert"
              className="mt-1 text-body-sm font-semibold text-overdue"
            >
              {errors.address.message}
            </p>
          )}
        </div>

        <div>
          <FieldLabel>
            State <span className="font-semibold text-ink-3">(optional)</span>
          </FieldLabel>
          <BrandSelect
            id="ob-state"
            value={selectedState}
            onValueChange={onStateChange}
            options={STATE_OPTIONS}
            placeholder="Select state…"
            ariaLabel="State"
            ariaDescribedBy={errors.stateCode ? "ob-state-error" : "ob-state-hint"}
            className="h-14 border-[1.5px] border-line bg-surface text-17 font-semibold text-ink hover:border-line-strong data-popup-open:border-coral focus-visible:ring-coral/14"
          />
          {errors.stateCode ? (
            <p
              id="ob-state-error"
              role="alert"
              className="mt-1 text-body-sm font-semibold text-overdue"
            >
              {errors.stateCode.message}
            </p>
          ) : (
            <p id="ob-state-hint" className="mt-2 text-caption text-ink-3">
              Sets the place of supply for GST on your invoices.
            </p>
          )}
        </div>

        <div>
          <FieldLabel htmlFor="ob-gstin">
            GSTIN <span className="font-semibold text-ink-3">(optional)</span>
          </FieldLabel>
          <IconInputField
            id="ob-gstin"
            type="text"
            autoComplete="off"
            maxLength={15}
            placeholder="27AAPFU0939F1ZV"
            aria-describedby={errors.gstin ? "ob-gstin-error" : "ob-gstin-hint"}
            aria-invalid={!!errors.gstin}
            leadingIcon={<GstCard className="size-5" />}
            error={!!errors.gstin}
            mono
            {...gstinProps}
            onChange={(e) => {
              e.target.value = e.target.value.toUpperCase();
              void gstinProps.onChange(e);
              onGstinChange(e.target.value);
            }}
          />
          {errors.gstin ? (
            <p
              id="ob-gstin-error"
              role="alert"
              className="mt-1 text-body-sm font-semibold text-overdue"
            >
              {errors.gstin.message}
            </p>
          ) : (
            <p id="ob-gstin-hint" className="mt-2 text-caption text-ink-3">
              15-character GST number. Add it to send GST-compliant invoices.
            </p>
          )}
        </div>

        <div>
          <FieldLabel htmlFor="ob-upi">
            UPI ID <span className="font-semibold text-ink-3">(optional)</span>
          </FieldLabel>
          <IconInputField
            id="ob-upi"
            type="text"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            placeholder="yourbiz@oksbi"
            aria-describedby={errors.upiId ? "ob-upi-error" : "ob-upi-hint"}
            aria-invalid={!!errors.upiId}
            leadingIcon={<UpiCard className="size-5" />}
            error={!!errors.upiId}
            {...register("upiId")}
          />
          {errors.upiId ? (
            <p
              id="ob-upi-error"
              role="alert"
              className="mt-1 text-body-sm font-semibold text-overdue"
            >
              {errors.upiId.message}
            </p>
          ) : (
            <p id="ob-upi-hint" className="mt-2 text-caption text-ink-3">
              Adds a one-tap &ldquo;Pay by UPI&rdquo; button to every invoice.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export { OnboardingDetailsPanel };
