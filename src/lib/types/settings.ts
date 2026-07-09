import type { ComponentType } from "react";
import type { Locale } from "@/lib/i18n/locale";

export type SettingsSectionId =
  | "business"
  | "template"
  | "tax"
  | "notifications"
  | "language"
  | "plan"
  | "items";

export interface SettingsSectionDef {
  id: SettingsSectionId;
  label: string;
  icon: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>;
}

export interface LanguageOption {
  id: Locale;
  label: string;
  sub: string;
  lang?: string;
}
