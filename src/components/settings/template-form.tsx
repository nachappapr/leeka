"use client";

import { useRef, useState, useTransition } from "react";
import type { KeyboardEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

import { Card } from "@/components/ui/custom/card";
import { FieldLabel } from "@/components/ui/custom/field-label";
import { InputField } from "@/components/ui/custom/input-field";
import { PillButton } from "@/components/ui/custom/pill-button";
import { brandToast } from "@/components/ui/custom/brand-toast";
import { AccentSwatch } from "@/components/settings/accent-swatch";
import { TemplateSchema, type TemplateFormData } from "@/lib/schema/template";
import { updateInvoiceTemplate } from "@/lib/actions/template";
import { SETTINGS_ACCENTS } from "@/lib/constants/settings";

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

export interface TemplatePrefill {
  accentColor: string;
  footerMessage: string;
}

interface TemplateFormProps {
  prefill: TemplatePrefill;
}

export function TemplateForm({ prefill }: TemplateFormProps) {
  const [isPending, startTransition] = useTransition();
  const [savedValues, setSavedValues] = useState<TemplatePrefill>(prefill);
  const radioGroupRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isDirty },
  } = useForm<TemplateFormData>({
    resolver: standardSchemaResolver(TemplateSchema),
    defaultValues: {
      accentColor: prefill.accentColor,
      footerMessage: prefill.footerMessage,
    },
  });

  const accentColor = useWatch({ control, name: "accentColor" });

  function handleCancel() {
    reset({
      accentColor: savedValues.accentColor,
      footerMessage: savedValues.footerMessage,
    });
  }

  function handleAccentKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const radios = radioGroupRef.current?.querySelectorAll<HTMLElement>('[role="radio"]');
    if (!radios) return;
    const arr = Array.from(radios);
    const currentIdx = arr.findIndex((el) => el === document.activeElement);
    if (currentIdx === -1) return;

    let nextIdx: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      nextIdx = (currentIdx + 1) % arr.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      nextIdx = (currentIdx - 1 + arr.length) % arr.length;
    } else if (e.key === "Home") {
      nextIdx = 0;
    } else if (e.key === "End") {
      nextIdx = arr.length - 1;
    }

    if (nextIdx !== null) {
      e.preventDefault();
      setValue("accentColor", SETTINGS_ACCENTS[nextIdx], { shouldDirty: true });
      arr[nextIdx].focus();
    }
  }

  function onSubmit(data: TemplateFormData) {
    startTransition(async () => {
      const result = await updateInvoiceTemplate({
        accentColor: data.accentColor,
        footerMessage: data.footerMessage,
      });

      if (!result.ok) {
        brandToast.error({ title: "Couldn't save invoice template", sub: result.error });
        return;
      }

      const next: TemplatePrefill = {
        accentColor: data.accentColor,
        footerMessage: data.footerMessage,
      };
      setSavedValues(next);
      reset(next);
      brandToast.success({ title: "Invoice template saved" });
    });
  }

  return (
    <Card title="Invoice template" headingLevel={3}>
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex flex-col gap-5 mb-5">
            <div>
              <FieldLabel id="accent-label">Accent colour</FieldLabel>
              <div
                ref={radioGroupRef}
                className="mt-1.5 flex flex-wrap gap-2.5"
                role="radiogroup"
                aria-labelledby="accent-label"
                aria-describedby={errors.accentColor ? "accent-error" : undefined}
                tabIndex={-1}
                onKeyDown={handleAccentKeyDown}
              >
                {SETTINGS_ACCENTS.map((color, idx) => {
                  const isSelected = accentColor === color;
                  const selectedIdx = SETTINGS_ACCENTS.findIndex((c) => c === accentColor);
                  const tabbable = isSelected || (selectedIdx === -1 && idx === 0);
                  return (
                    <AccentSwatch
                      key={color}
                      color={color}
                      selected={isSelected}
                      tabIndex={tabbable ? 0 : -1}
                      onSelect={() => setValue("accentColor", color, { shouldDirty: true })}
                    />
                  );
                })}
              </div>
              <FieldError id="accent-error" message={errors.accentColor?.message} />
            </div>

            <div>
              <FieldLabel htmlFor="tpl-footer">Footer message</FieldLabel>
              <InputField
                id="tpl-footer"
                size="web"
                aria-invalid={!!errors.footerMessage}
                aria-describedby={errors.footerMessage ? "tpl-footer-error" : undefined}
                {...register("footerMessage")}
              />
              <FieldError id="tpl-footer-error" message={errors.footerMessage?.message} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5">
            <span role="status" className="sr-only">
              {isPending ? "Saving invoice template…" : ""}
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
