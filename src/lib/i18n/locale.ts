export const SUPPORTED_LOCALES = ["en", "hi", "kn"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string | null | undefined): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function resolveLocale(
  cookieValue: string | null | undefined,
  profileValue: string | null | undefined,
): Locale {
  if (isLocale(cookieValue)) return cookieValue;
  if (isLocale(profileValue)) return profileValue;
  return DEFAULT_LOCALE;
}
