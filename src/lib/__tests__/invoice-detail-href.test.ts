import { describe, it, expect } from "vitest";
import {
  invoiceDetailHref,
  invoiceEditHref,
  invoiceRowHref,
} from "@/lib/invoice/invoice-detail-href";

describe("invoiceDetailHref", () => {
  it("uses the real UUID when present, ignoring the display id", () => {
    expect(
      invoiceDetailHref({
        id: "#34A4B93F",
        invoiceUuid: "34a4b93f-943f-4947-9617-46912575d97e",
      }),
    ).toBe("/invoices/34a4b93f-943f-4947-9617-46912575d97e");
  });

  it("falls back to the display id (leading # stripped) when no UUID", () => {
    expect(invoiceDetailHref({ id: "#34A4B93F" })).toBe("/invoices/34A4B93F");
  });

  it("leaves an already-bare id untouched in the fallback", () => {
    expect(invoiceDetailHref({ id: "INV-1040" })).toBe("/invoices/INV-1040");
  });

  it("strips only a leading #, not interior ones", () => {
    expect(invoiceDetailHref({ id: "#A#B" })).toBe("/invoices/A#B");
  });
});

describe("invoiceEditHref", () => {
  it("uses the real UUID when present and appends /edit", () => {
    expect(
      invoiceEditHref({
        id: "#34A4B93F",
        invoiceUuid: "34a4b93f-943f-4947-9617-46912575d97e",
      }),
    ).toBe("/invoices/34a4b93f-943f-4947-9617-46912575d97e/edit");
  });

  it("falls back to the display id (leading # stripped) when no UUID, appending /edit", () => {
    expect(invoiceEditHref({ id: "#34A4B93F" })).toBe("/invoices/34A4B93F/edit");
  });

  it("leaves an already-bare id untouched in the fallback", () => {
    expect(invoiceEditHref({ id: "INV-1040" })).toBe("/invoices/INV-1040/edit");
  });
});

describe("invoiceRowHref", () => {
  it("routes a draft straight to the edit page", () => {
    expect(
      invoiceRowHref({
        id: "#34A4B93F",
        invoiceUuid: "34a4b93f-943f-4947-9617-46912575d97e",
        status: "draft",
      }),
    ).toBe("/invoices/34a4b93f-943f-4947-9617-46912575d97e/edit");
  });

  it("routes a non-draft to the detail page", () => {
    expect(
      invoiceRowHref({
        id: "#34A4B93F",
        invoiceUuid: "34a4b93f-943f-4947-9617-46912575d97e",
        status: "sent",
      }),
    ).toBe("/invoices/34a4b93f-943f-4947-9617-46912575d97e");
  });

  it("falls back to the display id for drafts without a UUID", () => {
    expect(invoiceRowHref({ id: "#34A4B93F", status: "draft" })).toBe("/invoices/34A4B93F/edit");
  });
});
