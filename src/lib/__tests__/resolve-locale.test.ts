import { describe, it, expect } from "vitest";
import { resolveLocale } from "@/lib/i18n/locale";

describe("resolveLocale", () => {
  it("prefers a valid cookie value over a different valid profile value", () => {
    expect(resolveLocale("hi", "kn")).toBe("hi");
  });

  it("falls back to a valid profile value when the cookie is invalid", () => {
    expect(resolveLocale("fr", "kn")).toBe("kn");
  });

  it("falls back to a valid profile value when the cookie is absent", () => {
    expect(resolveLocale(null, "kn")).toBe("kn");
    expect(resolveLocale(undefined, "hi")).toBe("hi");
  });

  it("falls back to en when both cookie and profile are invalid or absent", () => {
    expect(resolveLocale(null, null)).toBe("en");
    expect(resolveLocale(undefined, undefined)).toBe("en");
    expect(resolveLocale("ta", "fr")).toBe("en");
    expect(resolveLocale("", "")).toBe("en");
  });

  it("ignores an unsupported cookie value at each unsupported/absent shape", () => {
    expect(resolveLocale("ta", "en")).toBe("en");
    expect(resolveLocale("", "hi")).toBe("hi");
    expect(resolveLocale(null, "en")).toBe("en");
    expect(resolveLocale(undefined, "kn")).toBe("kn");
  });

  it("ignores an unsupported profile value at each unsupported/absent shape", () => {
    expect(resolveLocale("hi", "ta")).toBe("hi");
    expect(resolveLocale("kn", "")).toBe("kn");
    expect(resolveLocale("en", null)).toBe("en");
    expect(resolveLocale("hi", undefined)).toBe("hi");
  });
});
