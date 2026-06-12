import { getBusinessTaxDefaults } from "@/lib/data/business";
import { TaxForm } from "@/components/settings/tax-form";

export async function TaxSection() {
  const defaults = await getBusinessTaxDefaults();

  const prefill = {
    defaultGstRate: defaults?.defaultGstRate ?? 18,
    gstEnabled: defaults?.gstEnabled ?? true,
  };

  return <TaxForm prefill={prefill} />;
}
