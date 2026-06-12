import type { RangeId } from "@/lib/types/reports";

export interface RangeDef {
  id: RangeId;
  label: string;
}

export const RANGE_DEFS: RangeDef[] = [
  { id: "3M", label: "3 months" },
  { id: "6M", label: "6 months" },
  { id: "12M", label: "12 months" },
  { id: "FY", label: "Financial year" },
];

export const DEFAULT_RANGE_ID: RangeId = "6M";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function toIsoDate(y: number, m: number, d: number): string {
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

/**
 * Computes from/to ISO date strings for a given range ID.
 * Calendar dates are IST-sensible: "today" is the server's current date.
 * from = first day of the starting calendar month.
 * to   = today (for 3M/6M/12M) or FY-end (Apr 1 → Mar 31).
 */
export function computeDateRange(rangeId: RangeId): { from: string; to: string; label: string } {
  const now = new Date();
  const todayY = now.getFullYear();
  const todayM = now.getMonth() + 1;
  const todayD = now.getDate();
  const toDate = toIsoDate(todayY, todayM, todayD);

  if (rangeId === "FY") {
    const fyStartYear = todayM >= 4 ? todayY : todayY - 1;
    const fyEndYear = fyStartYear + 1;
    const fyEnd = todayM < 4 ? toDate : toIsoDate(fyEndYear, 3, 31);
    const label = `FY ${fyStartYear}-${String(fyEndYear).slice(-2)}`;
    return {
      from: toIsoDate(fyStartYear, 4, 1),
      to: fyEnd,
      label,
    };
  }

  const months = rangeId === "3M" ? 3 : rangeId === "12M" ? 12 : 6;
  let fromY = todayY;
  let fromM = todayM - (months - 1);
  while (fromM <= 0) {
    fromM += 12;
    fromY -= 1;
  }

  return {
    from: toIsoDate(fromY, fromM, 1),
    to: toDate,
    label: RANGE_DEFS.find((r) => r.id === rangeId)?.label ?? rangeId,
  };
}
