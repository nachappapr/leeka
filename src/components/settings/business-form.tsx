"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

import { CameraIcon } from "@/components/icons";
import { Card } from "@/components/ui/custom/card";
import { FieldLabel } from "@/components/ui/custom/field-label";
import { InputField } from "@/components/ui/custom/input-field";
import { PillButton } from "@/components/ui/custom/pill-button";
import { brandToast } from "@/components/ui/custom/brand-toast";
import { BusinessSchema, type BusinessFormData } from "@/lib/schema/business";
import { updateBusinessProfile, uploadBusinessLogo } from "@/lib/actions/business";
import { LOGO_ALLOWED_MIME_TYPES, LOGO_MAX_BYTES } from "@/lib/constants/business";

export interface BusinessFormPrefill {
  name: string;
  address: string;
  gstin: string;
  upiId: string;
  logoUrl: string;
}

interface LogoBlockProps {
  name: string;
  logoSrc: string | null;
  isPending: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onButtonClick: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function LogoBlock({
  name,
  logoSrc,
  isPending,
  fileInputRef,
  onButtonClick,
  onFileChange,
}: LogoBlockProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mb-5 flex items-center gap-4">
      {logoSrc ? (
        <Image
          src={logoSrc}
          alt="Business logo"
          width={72}
          height={72}
          unoptimized
          className="h-18 w-18 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <div
          className="flex h-18 w-18 shrink-0 items-center justify-center rounded-xl bg-coral text-white"
          aria-label="Business logo placeholder"
          role="img"
        >
          <span className="text-money-sm font-extrabold" aria-hidden>
            {initials || "BZ"}
          </span>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept={LOGO_ALLOWED_MIME_TYPES.join(",")}
        className="sr-only"
        aria-label="Upload business logo"
        onChange={onFileChange}
        disabled={isPending}
      />
      <PillButton
        tone="outline"
        size="md"
        type="button"
        disabled={isPending}
        onClick={onButtonClick}
      >
        <CameraIcon size={16} aria-hidden />
        {isPending ? "Uploading…" : "Change logo"}
      </PillButton>
      <span role="status" className="sr-only">
        {isPending ? "Uploading logo…" : ""}
      </span>
    </div>
  );
}

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

interface BusinessFormProps {
  prefill: BusinessFormPrefill;
  phone: string;
  logoSignedUrl: string | null;
}

export function BusinessForm({ prefill, phone, logoSignedUrl }: BusinessFormProps) {
  const [isPending, startTransition] = useTransition();
  const [currentLogoSrc, setCurrentLogoSrc] = useState<string | null>(logoSignedUrl);
  const [savedValues, setSavedValues] = useState<BusinessFormPrefill>(prefill);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<BusinessFormData>({
    resolver: standardSchemaResolver(BusinessSchema),
    defaultValues: {
      name: prefill.name,
      address: prefill.address,
      gstin: prefill.gstin,
      upiId: prefill.upiId,
      logoUrl: prefill.logoUrl,
    },
  });

  function handleCancel() {
    reset({
      name: savedValues.name,
      address: savedValues.address,
      gstin: savedValues.gstin,
      upiId: savedValues.upiId,
      logoUrl: savedValues.logoUrl,
    });
  }

  function onSubmit(data: BusinessFormData) {
    startTransition(async () => {
      const result = await updateBusinessProfile({
        name: data.name,
        address: data.address,
        gstin: data.gstin,
        upiId: data.upiId,
        logoUrl: data.logoUrl,
      });

      if (!result.ok) {
        brandToast.error({ title: "Couldn't save profile", sub: result.error });
        return;
      }

      const next: BusinessFormPrefill = {
        name: data.name,
        address: data.address ?? "",
        gstin: data.gstin ?? "",
        upiId: data.upiId ?? "",
        logoUrl: data.logoUrl ?? "",
      };
      setSavedValues(next);
      reset(next);
      brandToast.success({ title: "Business profile saved" });
    });
  }

  function handleLogoButtonClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!(LOGO_ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
      brandToast.error({ title: "File type not allowed", sub: "Use PNG, JPEG, WebP, or SVG." });
      e.target.value = "";
      return;
    }

    if (file.size > LOGO_MAX_BYTES) {
      brandToast.error({ title: "File too large", sub: "Maximum logo size is 2 MB." });
      e.target.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResult = await uploadBusinessLogo(formData);
      if (!uploadResult.ok) {
        brandToast.error({ title: "Upload failed", sub: uploadResult.error });
        URL.revokeObjectURL(objectUrl);
        return;
      }

      const saveResult = await updateBusinessProfile({
        name: savedValues.name,
        address: savedValues.address,
        gstin: savedValues.gstin,
        upiId: savedValues.upiId,
        logoUrl: uploadResult.path,
      });

      if (!saveResult.ok) {
        brandToast.error({ title: "Couldn't save logo", sub: saveResult.error });
        URL.revokeObjectURL(objectUrl);
        return;
      }

      setSavedValues((prev) => ({ ...prev, logoUrl: uploadResult.path }));
      setCurrentLogoSrc(objectUrl);
      brandToast.success({ title: "Logo updated" });
    });

    e.target.value = "";
  }

  return (
    <Card title="Business profile" headingLevel={3}>
      <div className="p-6">
        <LogoBlock
          name={savedValues.name}
          logoSrc={currentLogoSrc}
          isPending={isPending}
          fileInputRef={fileInputRef}
          onButtonClick={handleLogoButtonClick}
          onFileChange={handleFileChange}
        />

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
            <div>
              <FieldLabel htmlFor="biz-name">Business name</FieldLabel>
              <InputField
                id="biz-name"
                autoComplete="organization"
                size="web"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "biz-name-error" : undefined}
                {...register("name")}
              />
              <FieldError id="biz-name-error" message={errors.name?.message} />
            </div>

            <div>
              <FieldLabel htmlFor="biz-phone">Phone</FieldLabel>
              <InputField
                id="biz-phone"
                value={phone}
                type="tel"
                autoComplete="tel"
                size="web"
                readOnly
                aria-readonly="true"
                className="text-ink-3 cursor-default"
              />
            </div>

            <div className="col-span-full">
              <FieldLabel htmlFor="biz-address">Address</FieldLabel>
              <InputField
                id="biz-address"
                autoComplete="street-address"
                size="web"
                aria-invalid={!!errors.address}
                aria-describedby={errors.address ? "biz-address-error" : undefined}
                {...register("address")}
              />
              <FieldError id="biz-address-error" message={errors.address?.message} />
            </div>

            <div>
              <FieldLabel htmlFor="biz-gstin">GSTIN (optional)</FieldLabel>
              <InputField
                id="biz-gstin"
                autoComplete="off"
                size="web"
                aria-invalid={!!errors.gstin}
                aria-describedby={errors.gstin ? "biz-gstin-error" : undefined}
                {...register("gstin")}
              />
              <FieldError id="biz-gstin-error" message={errors.gstin?.message} />
            </div>

            <div>
              <FieldLabel htmlFor="biz-upi">UPI ID (optional)</FieldLabel>
              <InputField
                id="biz-upi"
                autoComplete="off"
                size="web"
                aria-invalid={!!errors.upiId}
                aria-describedby={errors.upiId ? "biz-upi-error" : undefined}
                {...register("upiId")}
              />
              <FieldError id="biz-upi-error" message={errors.upiId?.message} />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2.5">
            <span role="status" className="sr-only">
              {isPending ? "Saving business profile…" : ""}
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
