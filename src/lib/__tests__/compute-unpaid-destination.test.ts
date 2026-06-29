import { describe, it, expect } from "vitest";
import {
  computeUnpaidDestination,
  computeReversible,
} from "@/lib/invoice/compute-unpaid-destination";

const TODAY = "2026-06-29";

// ─── computeUnpaidDestination ─────────────────────────────────────────────────

describe("computeUnpaidDestination — overdue", () => {
  it("returns overdue when due_date is in the past", () => {
    expect(computeUnpaidDestination("2026-06-01", null, TODAY)).toBe("overdue");
  });

  it("returns overdue when due_date is yesterday", () => {
    expect(computeUnpaidDestination("2026-06-28", null, TODAY)).toBe("overdue");
  });

  it("returns overdue when due_date is past and viewed_at is set", () => {
    expect(computeUnpaidDestination("2026-06-01", "2026-06-02T10:00:00Z", TODAY)).toBe("overdue");
  });
});

describe("computeUnpaidDestination — viewed", () => {
  it("returns viewed when due_date is today (not yet past) and viewed_at is set", () => {
    expect(computeUnpaidDestination(TODAY, "2026-06-29T08:00:00Z", TODAY)).toBe("viewed");
  });

  it("returns viewed when due_date is in the future and viewed_at is set", () => {
    expect(computeUnpaidDestination("2026-07-15", "2026-06-29T08:00:00Z", TODAY)).toBe("viewed");
  });

  it("returns viewed when due_date is null and viewed_at is set", () => {
    expect(computeUnpaidDestination(null, "2026-06-29T08:00:00Z", TODAY)).toBe("viewed");
  });
});

describe("computeUnpaidDestination — sent", () => {
  it("returns sent when due_date is in the future and viewed_at is null", () => {
    expect(computeUnpaidDestination("2026-07-15", null, TODAY)).toBe("sent");
  });

  it("returns sent when due_date is today and viewed_at is null", () => {
    expect(computeUnpaidDestination(TODAY, null, TODAY)).toBe("sent");
  });

  it("returns sent when due_date is null and viewed_at is null", () => {
    expect(computeUnpaidDestination(null, null, TODAY)).toBe("sent");
  });
});

// ─── computeReversible ────────────────────────────────────────────────────────

describe("computeReversible — manual payments only", () => {
  it("returns true when payments is null", () => {
    expect(computeReversible(null)).toBe(true);
  });

  it("returns true when payments is empty", () => {
    expect(computeReversible([])).toBe(true);
  });

  it("returns true when all payments are manual", () => {
    expect(computeReversible([{ source: "manual" }, { source: "manual" }])).toBe(true);
  });
});

describe("computeReversible — gateway payments present", () => {
  it("returns false when any payment has a non-manual source", () => {
    expect(computeReversible([{ source: "razorpay" }])).toBe(false);
  });

  it("returns false when mixed manual and gateway payments", () => {
    expect(computeReversible([{ source: "manual" }, { source: "stripe" }])).toBe(false);
  });
});
