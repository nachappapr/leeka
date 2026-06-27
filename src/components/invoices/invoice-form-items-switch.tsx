"use client";

import type { Control, UseFormRegister } from "react-hook-form";

import { useIsMobile } from "@/hooks/use-mobile";
import type { DraftFormData } from "@/lib/schema/invoice";

import { InvoiceFormItemsMobile } from "./invoice-form-items-mobile";
import { InvoiceFormItemsTable } from "./invoice-form-items-table";

interface InvoiceFormItemsSwitchProps {
  fields: Array<{
    id: string;
    name: string;
    qty: number;
    unit_price: number;
    discount: number;
    gst_rate: number;
  }>;
  register: UseFormRegister<DraftFormData>;
  control: Control<DraftFormData>;
  remove: (index: number) => void;
}

export function InvoiceFormItemsSwitch({
  fields,
  register,
  control,
  remove,
}: InvoiceFormItemsSwitchProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <InvoiceFormItemsMobile
        fields={fields}
        register={register}
        control={control}
        remove={remove}
      />
    );
  }

  return (
    <InvoiceFormItemsTable fields={fields} register={register} control={control} remove={remove} />
  );
}
