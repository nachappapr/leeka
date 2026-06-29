export type UnpaidDestination = "overdue" | "viewed" | "sent";

/**
 * Mirrors the RPC rule exactly: due_date < today-in-IST → overdue;
 * viewed_at non-null → viewed; else → sent.
 *
 * todayIst is injectable (YYYY-MM-DD) so callers can pin the date in tests
 * without needing to mock Date globally. Production callers pass the result of
 * `new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date())`
 * computed once in the Server Component mapper before calling this function.
 */
export function computeUnpaidDestination(
  due_date: string | null,
  viewed_at: string | null,
  todayIst: string,
): UnpaidDestination {
  if (due_date !== null && due_date < todayIst) return "overdue";
  if (viewed_at !== null) return "viewed";
  return "sent";
}

export function computeReversible(
  payments: ReadonlyArray<{ source: string }> | null | undefined,
): boolean {
  return !(payments ?? []).some((p) => p.source !== "manual");
}
