import { describe, it, expect } from "vitest";
import {
  formatChartMonthLabel,
  formatPaiseAxisTick,
  formatPaiseFull,
  shapeChartSeries,
} from "@/lib/reports/chart-format";

describe("formatChartMonthLabel", () => {
  it("formats YYYY-MM as short month + 2-digit year in en-IN", () => {
    expect(formatChartMonthLabel("2026-07")).toBe("Jul 26");
  });

  it("handles December without rolling the year", () => {
    expect(formatChartMonthLabel("2025-12")).toBe("Dec 25");
  });

  it("handles single-digit months", () => {
    expect(formatChartMonthLabel("2026-01")).toBe("Jan 26");
  });
});

describe("formatPaiseAxisTick", () => {
  it("renders zero as a bare 0", () => {
    expect(formatPaiseAxisTick(0)).toBe("0");
  });

  it("abbreviates thousands of rupees with a k suffix", () => {
    expect(formatPaiseAxisTick(1200000)).toBe("₹12k");
  });

  it("rounds to the nearest thousand rupees", () => {
    expect(formatPaiseAxisTick(990000)).toBe("₹10k");
  });

  it("keeps large values in the k unit", () => {
    expect(formatPaiseAxisTick(2500000000)).toBe("₹25000k");
  });
});

describe("formatPaiseFull", () => {
  it("formats paise as full rupees with en-IN grouping", () => {
    expect(formatPaiseFull(123456700)).toBe("₹12,34,567");
  });

  it("formats zero as ₹0", () => {
    expect(formatPaiseFull(0)).toBe("₹0");
  });

  it("rounds fractional rupees to whole rupees", () => {
    expect(formatPaiseFull(123450)).toBe("₹1,235");
  });
});

describe("shapeChartSeries", () => {
  it("shapes month points into labelled revenue/received data", () => {
    expect(
      shapeChartSeries([
        { month: "2026-06", revenue: 500000, received: 300000 },
        { month: "2026-07", revenue: 800000, received: 800000 },
      ]),
    ).toEqual([
      { month: "2026-06", label: "Jun 26", revenue: 500000, received: 300000 },
      { month: "2026-07", label: "Jul 26", revenue: 800000, received: 800000 },
    ]);
  });

  it("keeps a revenue-only month with received at zero", () => {
    expect(shapeChartSeries([{ month: "2026-05", revenue: 250000, received: 0 }])).toEqual([
      { month: "2026-05", label: "May 26", revenue: 250000, received: 0 },
    ]);
  });

  it("keeps zero-activity months as explicit zero points", () => {
    expect(shapeChartSeries([{ month: "2026-04", revenue: 0, received: 0 }])).toEqual([
      { month: "2026-04", label: "Apr 26", revenue: 0, received: 0 },
    ]);
  });

  it("returns an empty series for no months", () => {
    expect(shapeChartSeries([])).toEqual([]);
  });
});
