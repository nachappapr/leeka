import { describe, it, expect } from "vitest";
import { invoiceRowActions } from "@/lib/invoice/invoice-row-actions";
import type { ActionDescriptor } from "@/lib/invoice/invoice-row-actions";
import type { InvoiceStatus } from "@/lib/types/lifecycle";

function find(descriptors: ActionDescriptor[], id: ActionDescriptor["id"]): ActionDescriptor {
  const d = descriptors.find((x) => x.id === id);
  if (!d) throw new Error(`Descriptor not found: ${id}`);
  return d;
}

const ALL_STATUSES: InvoiceStatus[] = [
  "draft",
  "sent",
  "viewed",
  "partial",
  "pending",
  "paid",
  "overdue",
  "cancelled",
];

// ─── Shape invariants ────────────────────────────────────────────────────────

describe("invoiceRowActions — shape invariants", () => {
  it("returns exactly 7 descriptors for every status", () => {
    for (const status of ALL_STATUSES) {
      expect(invoiceRowActions({ status })).toHaveLength(7);
    }
  });

  it("returns descriptors in the fixed render order for every status", () => {
    const expectedOrder: ActionDescriptor["id"][] = [
      "markPaid",
      "whatsapp",
      "copyLink",
      "edit",
      "duplicate",
      "pdf",
      "deleteOrCancel",
    ];
    for (const status of ALL_STATUSES) {
      const ids = invoiceRowActions({ status }).map((d) => d.id);
      expect(ids).toEqual(expectedOrder);
    }
  });
});

// ─── Per-status contracts ────────────────────────────────────────────────────

describe("invoiceRowActions — draft", () => {
  const descriptors = invoiceRowActions({ status: "draft" });

  it("markPaid: disabled, default, hint about issuing first", () => {
    const d = find(descriptors, "markPaid");
    expect(d.enabled).toBe(false);
    expect(d.variant).toBe("default");
    expect(d.intent).toBe("markPaid");
    expect(d.label).toBe("Mark paid");
    expect(d.hint).toBe("Issue the invoice before recording payment");
  });

  it("whatsapp: disabled, Send label, hint about issuing first", () => {
    const d = find(descriptors, "whatsapp");
    expect(d.enabled).toBe(false);
    expect(d.label).toBe("Send on WhatsApp");
    expect(d.variant).toBe("default");
    expect(d.intent).toBe("send");
    expect(d.hint).toBe("Issue the invoice first");
  });

  it("copyLink: disabled, hint about no pay link yet", () => {
    const d = find(descriptors, "copyLink");
    expect(d.enabled).toBe(false);
    expect(d.label).toBe("Copy pay link");
    expect(d.variant).toBe("default");
    expect(d.intent).toBe("copyLink");
    expect(d.hint).toBe("No payment link yet — issue the invoice first");
  });

  it("edit: enabled, no hint", () => {
    const d = find(descriptors, "edit");
    expect(d.enabled).toBe(true);
    expect(d.label).toBe("Edit invoice");
    expect(d.variant).toBe("default");
    expect(d.intent).toBe("edit");
    expect(d.hint).toBeUndefined();
  });

  it("duplicate: enabled, no hint", () => {
    const d = find(descriptors, "duplicate");
    expect(d.enabled).toBe(true);
    expect(d.label).toBe("Duplicate");
    expect(d.variant).toBe("default");
    expect(d.intent).toBe("duplicate");
    expect(d.hint).toBeUndefined();
  });

  it("pdf: disabled, Coming soon hint", () => {
    const d = find(descriptors, "pdf");
    expect(d.enabled).toBe(false);
    expect(d.label).toBe("Download PDF");
    expect(d.variant).toBe("default");
    expect(d.intent).toBe("pdf");
    expect(d.hint).toBe("Coming soon");
  });

  it("deleteOrCancel: enabled, Delete label, delete intent, no hint", () => {
    const d = find(descriptors, "deleteOrCancel");
    expect(d.enabled).toBe(true);
    expect(d.label).toBe("Delete");
    expect(d.intent).toBe("delete");
    expect(d.variant).toBe("destructive");
    expect(d.hint).toBeUndefined();
  });
});

describe("invoiceRowActions — sent", () => {
  const descriptors = invoiceRowActions({ status: "sent" });

  it("markPaid: enabled, primary, no hint", () => {
    const d = find(descriptors, "markPaid");
    expect(d.enabled).toBe(true);
    expect(d.variant).toBe("primary");
    expect(d.intent).toBe("markPaid");
    expect(d.hint).toBeUndefined();
  });

  it("whatsapp: enabled, Send label, default variant", () => {
    const d = find(descriptors, "whatsapp");
    expect(d.enabled).toBe(true);
    expect(d.label).toBe("Send on WhatsApp");
    expect(d.variant).toBe("default");
    expect(d.intent).toBe("send");
    expect(d.hint).toBeUndefined();
  });

  it("copyLink: enabled, no hint", () => {
    const d = find(descriptors, "copyLink");
    expect(d.enabled).toBe(true);
    expect(d.hint).toBeUndefined();
  });

  it("edit: disabled, duplicate hint", () => {
    const d = find(descriptors, "edit");
    expect(d.enabled).toBe(false);
    expect(d.hint).toBe("Issued invoices can't be edited — duplicate to make a corrected copy");
  });

  it("duplicate: enabled, no hint", () => {
    expect(find(descriptors, "duplicate").enabled).toBe(true);
  });

  it("pdf: disabled, Coming soon", () => {
    const d = find(descriptors, "pdf");
    expect(d.enabled).toBe(false);
    expect(d.hint).toBe("Coming soon");
  });

  it("deleteOrCancel: enabled, Cancel invoice label, cancel intent", () => {
    const d = find(descriptors, "deleteOrCancel");
    expect(d.enabled).toBe(true);
    expect(d.label).toBe("Cancel invoice");
    expect(d.intent).toBe("cancel");
    expect(d.variant).toBe("destructive");
    expect(d.hint).toBeUndefined();
  });
});

describe("invoiceRowActions — viewed", () => {
  const descriptors = invoiceRowActions({ status: "viewed" });

  it("markPaid: enabled, primary", () => {
    const d = find(descriptors, "markPaid");
    expect(d.enabled).toBe(true);
    expect(d.variant).toBe("primary");
  });

  it("whatsapp: enabled, Send label (same as sent)", () => {
    const d = find(descriptors, "whatsapp");
    expect(d.enabled).toBe(true);
    expect(d.label).toBe("Send on WhatsApp");
  });

  it("copyLink: enabled", () => {
    expect(find(descriptors, "copyLink").enabled).toBe(true);
  });

  it("deleteOrCancel: enabled, Cancel invoice label, cancel intent", () => {
    const d = find(descriptors, "deleteOrCancel");
    expect(d.enabled).toBe(true);
    expect(d.label).toBe("Cancel invoice");
    expect(d.intent).toBe("cancel");
  });
});

describe("invoiceRowActions — partial", () => {
  const descriptors = invoiceRowActions({ status: "partial" });

  it("markPaid: enabled, primary", () => {
    const d = find(descriptors, "markPaid");
    expect(d.enabled).toBe(true);
    expect(d.variant).toBe("primary");
  });

  it("whatsapp: enabled, Remind label", () => {
    const d = find(descriptors, "whatsapp");
    expect(d.enabled).toBe(true);
    expect(d.label).toBe("Remind on WhatsApp");
    expect(d.variant).toBe("default");
    expect(d.intent).toBe("send");
    expect(d.hint).toBeUndefined();
  });

  it("copyLink: enabled", () => {
    expect(find(descriptors, "copyLink").enabled).toBe(true);
  });

  it("deleteOrCancel: enabled, Cancel invoice label", () => {
    const d = find(descriptors, "deleteOrCancel");
    expect(d.enabled).toBe(true);
    expect(d.label).toBe("Cancel invoice");
    expect(d.intent).toBe("cancel");
  });
});

describe("invoiceRowActions — pending", () => {
  const descriptors = invoiceRowActions({ status: "pending" });

  it("markPaid: enabled, primary", () => {
    expect(find(descriptors, "markPaid").enabled).toBe(true);
    expect(find(descriptors, "markPaid").variant).toBe("primary");
  });

  it("whatsapp: enabled, Remind label", () => {
    const d = find(descriptors, "whatsapp");
    expect(d.enabled).toBe(true);
    expect(d.label).toBe("Remind on WhatsApp");
  });

  it("copyLink: enabled", () => {
    expect(find(descriptors, "copyLink").enabled).toBe(true);
  });

  it("deleteOrCancel: enabled, Cancel invoice label", () => {
    const d = find(descriptors, "deleteOrCancel");
    expect(d.enabled).toBe(true);
    expect(d.label).toBe("Cancel invoice");
    expect(d.intent).toBe("cancel");
  });
});

describe("invoiceRowActions — overdue", () => {
  const descriptors = invoiceRowActions({ status: "overdue" });

  it("markPaid: enabled, primary", () => {
    expect(find(descriptors, "markPaid").enabled).toBe(true);
    expect(find(descriptors, "markPaid").variant).toBe("primary");
  });

  it("whatsapp: enabled, Remind label", () => {
    const d = find(descriptors, "whatsapp");
    expect(d.enabled).toBe(true);
    expect(d.label).toBe("Remind on WhatsApp");
  });

  it("copyLink: enabled", () => {
    expect(find(descriptors, "copyLink").enabled).toBe(true);
  });

  it("deleteOrCancel: enabled, Cancel invoice label, cancel intent", () => {
    const d = find(descriptors, "deleteOrCancel");
    expect(d.enabled).toBe(true);
    expect(d.label).toBe("Cancel invoice");
    expect(d.intent).toBe("cancel");
  });
});

describe("invoiceRowActions — paid", () => {
  const descriptors = invoiceRowActions({ status: "paid" });

  it("markPaid: disabled, default, already paid hint", () => {
    const d = find(descriptors, "markPaid");
    expect(d.enabled).toBe(false);
    expect(d.variant).toBe("default");
    expect(d.hint).toBe("This invoice is already paid");
  });

  it("whatsapp: disabled, Send label, already paid hint", () => {
    const d = find(descriptors, "whatsapp");
    expect(d.enabled).toBe(false);
    expect(d.label).toBe("Send on WhatsApp");
    expect(d.variant).toBe("default");
    expect(d.hint).toBe("Already paid — nothing left to collect");
  });

  it("copyLink: enabled, receipt link label, no hint", () => {
    const d = find(descriptors, "copyLink");
    expect(d.enabled).toBe(true);
    expect(d.label).toBe("Copy receipt link");
    expect(d.intent).toBe("copyLink");
    expect(d.variant).toBe("default");
    expect(d.hint).toBeUndefined();
  });

  it("edit: disabled, duplicate hint", () => {
    const d = find(descriptors, "edit");
    expect(d.enabled).toBe(false);
    expect(d.hint).toBe("Issued invoices can't be edited — duplicate to make a corrected copy");
  });

  it("duplicate: enabled, no hint", () => {
    const d = find(descriptors, "duplicate");
    expect(d.enabled).toBe(true);
    expect(d.hint).toBeUndefined();
  });

  it("pdf: disabled, Coming soon", () => {
    expect(find(descriptors, "pdf").enabled).toBe(false);
    expect(find(descriptors, "pdf").hint).toBe("Coming soon");
  });

  it("deleteOrCancel: disabled, Delete label, delete intent, paid hint", () => {
    const d = find(descriptors, "deleteOrCancel");
    expect(d.enabled).toBe(false);
    expect(d.label).toBe("Delete");
    expect(d.intent).toBe("delete");
    expect(d.variant).toBe("destructive");
    expect(d.hint).toBe("A paid invoice can't be deleted");
  });
});

describe("invoiceRowActions — cancelled", () => {
  const descriptors = invoiceRowActions({ status: "cancelled" });

  it("markPaid: disabled, default, cancelled hint", () => {
    const d = find(descriptors, "markPaid");
    expect(d.enabled).toBe(false);
    expect(d.variant).toBe("default");
    expect(d.hint).toBe("A cancelled invoice can't be paid");
  });

  it("whatsapp: disabled, Send label, link dead hint", () => {
    const d = find(descriptors, "whatsapp");
    expect(d.enabled).toBe(false);
    expect(d.label).toBe("Send on WhatsApp");
    expect(d.variant).toBe("default");
    expect(d.hint).toBe("This invoice is cancelled — its link is dead");
  });

  it("copyLink: disabled, link dead hint", () => {
    const d = find(descriptors, "copyLink");
    expect(d.enabled).toBe(false);
    expect(d.hint).toBe("This invoice is cancelled — its link is dead");
  });

  it("edit: disabled, duplicate hint", () => {
    const d = find(descriptors, "edit");
    expect(d.enabled).toBe(false);
    expect(d.hint).toBe("Issued invoices can't be edited — duplicate to make a corrected copy");
  });

  it("duplicate: enabled, no hint", () => {
    expect(find(descriptors, "duplicate").enabled).toBe(true);
    expect(find(descriptors, "duplicate").hint).toBeUndefined();
  });

  it("pdf: disabled, Coming soon", () => {
    expect(find(descriptors, "pdf").enabled).toBe(false);
    expect(find(descriptors, "pdf").hint).toBe("Coming soon");
  });

  it("deleteOrCancel: disabled, Delete label, delete intent, audit trail hint", () => {
    const d = find(descriptors, "deleteOrCancel");
    expect(d.enabled).toBe(false);
    expect(d.label).toBe("Delete");
    expect(d.intent).toBe("delete");
    expect(d.variant).toBe("destructive");
    expect(d.hint).toBe("Cancelled invoices are kept for your audit trail");
  });
});

// ─── Cross-cutting invariants ────────────────────────────────────────────────

describe("invoiceRowActions — primary variant invariants", () => {
  const enabledMarkPaidStatuses: InvoiceStatus[] = [
    "sent",
    "viewed",
    "partial",
    "pending",
    "overdue",
  ];
  const noMarkPaidStatuses: InvoiceStatus[] = ["draft", "paid", "cancelled"];

  it("exactly one descriptor has variant primary for the 5 enabled-markPaid statuses", () => {
    for (const status of enabledMarkPaidStatuses) {
      const descriptors = invoiceRowActions({ status });
      const primaries = descriptors.filter((d) => d.variant === "primary");
      expect(primaries).toHaveLength(1);
      expect(primaries[0].id).toBe("markPaid");
    }
  });

  it("zero descriptors have variant primary for draft, paid, cancelled", () => {
    for (const status of noMarkPaidStatuses) {
      const descriptors = invoiceRowActions({ status });
      const primaries = descriptors.filter((d) => d.variant === "primary");
      expect(primaries).toHaveLength(0);
    }
  });

  it("whatsapp never has variant primary on any status", () => {
    for (const status of ALL_STATUSES) {
      const d = find(invoiceRowActions({ status }), "whatsapp");
      expect(d.variant).not.toBe("primary");
    }
  });

  it("whatsapp always has variant default on every status", () => {
    for (const status of ALL_STATUSES) {
      const d = find(invoiceRowActions({ status }), "whatsapp");
      expect(d.variant).toBe("default");
    }
  });
});

describe("invoiceRowActions — duplicate always enabled", () => {
  it("duplicate is enabled on every status", () => {
    for (const status of ALL_STATUSES) {
      const d = find(invoiceRowActions({ status }), "duplicate");
      expect(d.enabled).toBe(true);
    }
  });
});

describe("invoiceRowActions — pdf always disabled", () => {
  it("pdf is disabled on every status with a Coming soon hint", () => {
    for (const status of ALL_STATUSES) {
      const d = find(invoiceRowActions({ status }), "pdf");
      expect(d.enabled).toBe(false);
      expect(d.hint).toBe("Coming soon");
    }
  });
});

describe("invoiceRowActions — edit only enabled on draft", () => {
  it("edit is enabled only for draft, disabled for all others", () => {
    expect(find(invoiceRowActions({ status: "draft" }), "edit").enabled).toBe(true);
    for (const status of ALL_STATUSES.filter((s) => s !== "draft")) {
      expect(find(invoiceRowActions({ status }), "edit").enabled).toBe(false);
    }
  });
});

describe("invoiceRowActions — deleteOrCancel label/intent flip", () => {
  it("Delete/delete for draft, paid, cancelled", () => {
    for (const status of ["draft", "paid", "cancelled"] as InvoiceStatus[]) {
      const d = find(invoiceRowActions({ status }), "deleteOrCancel");
      expect(d.label).toBe("Delete");
      expect(d.intent).toBe("delete");
    }
  });

  it("Cancel invoice / cancel intent for sent, viewed, partial, pending, overdue", () => {
    for (const status of ["sent", "viewed", "partial", "pending", "overdue"] as InvoiceStatus[]) {
      const d = find(invoiceRowActions({ status }), "deleteOrCancel");
      expect(d.label).toBe("Cancel invoice");
      expect(d.intent).toBe("cancel");
    }
  });
});
