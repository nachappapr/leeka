"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

import { OnboardingBusinessSchema, type OnboardingBusinessFormData } from "@/lib/schema/business";
import { createBusiness } from "@/lib/actions/business";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { OnboardingInvoicePreview } from "@/components/onboarding/onboarding-invoice-preview";

interface OnboardingClientProps {
  prefillName?: string;
  displayName?: string | null;
  phone?: string | null;
}

function OnboardingClient({ prefillName, displayName, phone }: OnboardingClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors },
  } = useForm<OnboardingBusinessFormData>({
    resolver: standardSchemaResolver(OnboardingBusinessSchema),
    defaultValues: {
      name: prefillName ?? "",
      ownerName: displayName ?? "",
      address: "",
      stateCode: "",
      gstin: "",
      upiId: "",
      businessType: undefined,
    },
  });

  const watchedName = useWatch({ control, name: "name" }) ?? "";
  const watchedOwner = useWatch({ control, name: "ownerName" }) ?? "";
  const watchedType = useWatch({ control, name: "businessType" });
  const watchedAddress = useWatch({ control, name: "address" }) ?? "";
  const watchedState = useWatch({ control, name: "stateCode" }) ?? "";
  const watchedGstin = useWatch({ control, name: "gstin" }) ?? "";
  const watchedUpi = useWatch({ control, name: "upiId" }) ?? "";

  const isCtaDisabled = !(watchedName.trim() && watchedOwner.trim() && watchedType);

  function onSubmit(data: OnboardingBusinessFormData) {
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
    <div className="grid min-h-screen items-start grid-cols-[1.05fr_0.95fr] max-tablet:grid-cols-1">
      <OnboardingForm
        displayName={displayName}
        phone={phone}
        register={register}
        errors={errors}
        setValue={setValue}
        selectedType={watchedType}
        selectedState={watchedState}
        isCtaDisabled={isCtaDisabled}
        isPending={isPending}
        onGstinChange={(val) => setValue("gstin", val)}
        onSubmit={handleSubmit(onSubmit)}
      />
      <OnboardingInvoicePreview
        name={watchedName}
        address={watchedAddress}
        stateCode={watchedState}
        gstin={watchedGstin}
        upiId={watchedUpi}
      />
    </div>
  );
}

export { OnboardingClient };
