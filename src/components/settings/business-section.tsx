import { getBusinessForUser, getBusinessLogoSignedUrl } from "@/lib/data/business";
import { getProfile } from "@/lib/data/profile";
import { BusinessForm, type BusinessFormPrefill } from "@/components/settings/business-form";

export async function BusinessSection() {
  const [business, profile] = await Promise.all([getBusinessForUser(), getProfile()]);

  const logoSignedUrl = business?.logo_url
    ? await getBusinessLogoSignedUrl(business.logo_url)
    : null;

  const prefill: BusinessFormPrefill = {
    name: business?.name ?? "",
    address: business?.address ?? "",
    gstin: business?.gstin ?? "",
    upiId: business?.upi_id ?? "",
    logoUrl: business?.logo_url ?? "",
  };

  const phone = profile?.phone ?? "";

  return <BusinessForm prefill={prefill} phone={phone} logoSignedUrl={logoSignedUrl} />;
}
