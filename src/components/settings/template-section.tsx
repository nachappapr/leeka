import { getBusinessTemplate } from "@/lib/data/business";
import { SETTINGS_ACCENTS } from "@/lib/constants/settings";
import { TemplateForm } from "@/components/settings/template-form";

const DEFAULT_FOOTER = "Thank you for your business!";

export async function TemplateSection() {
  const template = await getBusinessTemplate();

  const rawAccent = template?.accentColor ?? SETTINGS_ACCENTS[0];
  const accentColor = (SETTINGS_ACCENTS as readonly string[]).includes(rawAccent)
    ? rawAccent
    : (SETTINGS_ACCENTS[0] ?? "#F46A39");

  const prefill = {
    accentColor,
    footerMessage: template?.footerMessage ?? DEFAULT_FOOTER,
  };

  return <TemplateForm prefill={prefill} />;
}
