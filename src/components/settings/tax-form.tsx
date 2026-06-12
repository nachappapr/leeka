"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

import { Card } from "@/components/ui/custom/card";
import { FieldLabel } from "@/components/ui/custom/field-label";
import { InputField } from "@/components/ui/custom/input-field";
import { ToggleSwitch } from "@/components/ui/custom/toggle-switch";
import { PillButton } from "@/components/ui/custom/pill-button";
import { brandToast } from "@/components/ui/custom/brand-toast";
import { TaxSchema, type TaxFormData } from "@/lib/schema/tax";
import { updateTaxDefaults } from "@/lib/actions/business";

interface FieldErrorProps {
  id: string;
  message: string | undefined;
}

function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-body-sm text-overdue">
      {message}
    </p>
  );
}

export interface TaxFormPrefill {
  defaultGstRate: number;
  gstEnabled: boolean;
}

interface TaxFormProps {
  prefill: TaxFormPrefill;
}

export function TaxForm({ prefill }: TaxFormProps) {
  const [isPending, startTransition] = useTransition();
  const [savedValues, setSavedValues] = useState<TaxFormPrefill>(prefill);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isDirty },
  } = useForm<TaxFormData>({
    resolver: standardSchemaResolver(TaxSchema),
    defaultValues: {
      defaultGstRate: prefill.defaultGstRate,
      gstEnabled: prefill.gstEnabled,
    },
  });

  const gstEnabled = useWatch({ control, name: "gstEnabled" });

  function handleCancel() {
    reset({
      defaultGstRate: savedValues.defaultGstRate,
      gstEnabled: savedValues.gstEnabled,
    });
  }

  function onSubmit(data: TaxFormData) {
    startTransition(async () => {
      const result = await updateTaxDefaults({
        defaultGstRate: data.defaultGstRate,
        gstEnabled: data.gstEnabled,
      });

      if (!result.ok) {
        brandToast.error({ title: "Couldn't save tax defaults", sub: result.error });
        return;
      }

      const next: TaxFormPrefill = {
        defaultGstRate: data.defaultGstRate,
        gstEnabled: data.gstEnabled,
      };
      setSavedValues(next);
      reset(next);
      brandToast.success({ title: "Tax defaults saved" });
    });
  }

  return (
    <Card title="Tax & GST defaults" headingLevel={3}>
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
            <div>
              <FieldLabel htmlFor="tax-type">Tax type</FieldLabel>
              <InputField
                id="tax-type"
                value="GST"
                size="web"
                readOnly
                aria-readonly="true"
                className="text-ink-3 cursor-default"
              />
              <p className="mt-1 text-caption text-ink-3">India — GST only</p>
            </div>

            <div>
              <FieldLabel htmlFor="tax-rate">Default tax rate (%)</FieldLabel>
              <InputField
                id="tax-rate"
                type="number"
                inputMode="numeric"
                min={0}
                max={28}
                step={1}
                size="web"
                aria-invalid={!!errors.defaultGstRate}
                aria-describedby={errors.defaultGstRate ? "tax-rate-error" : undefined}
                {...register("defaultGstRate", { valueAsNumber: true })}
              />
              <FieldError id="tax-rate-error" message={errors.defaultGstRate?.message} />
            </div>
          </div>

          <div>
            <ToggleSwitch
              id="tax-toggle-include-gst"
              label="Include GST by default on new invoices"
              checked={gstEnabled}
              onCheckedChange={(v) => setValue("gstEnabled", v, { shouldDirty: true })}
            />
          </div>

          <div className="mt-5 flex items-center justify-end gap-2.5">
            <span role="status" className="sr-only">
              {isPending ? "Saving tax defaults…" : ""}
            </span>
            <PillButton
              tone="ghost"
              size="md"
              type="button"
              disabled={isPending || !isDirty}
              onClick={handleCancel}
            >
              Cancel
            </PillButton>
            <PillButton tone="primary" size="md" type="submit" disabled={isPending || !isDirty}>
              {isPending ? "Saving…" : "Save changes"}
            </PillButton>
          </div>
        </form>
      </div>
    </Card>
  );
}
