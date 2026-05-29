import type { Invoice } from "@/lib/types"
import type { DashSortId } from "@/lib/types/dashboard"
import type { StatusPillStatus } from "@/components/ui/custom/status-pill"

/** Parse "₹24,500" → 24500. Returns 0 for unparseable strings. */
export function parseRupeeString(amount: string): number {
  const n = Number(amount.replace(/[₹,\s]/g, ""))
  return Number.isFinite(n) ? n : 0
}

/**
 * Filter invoices by status list (empty = all), then sort by the given DashSortId.
 * Returns a new array; original is not mutated.
 */
export function applyDashSortFilter(
  invoices: ReadonlyArray<Invoice>,
  sort: DashSortId,
  statuses: ReadonlyArray<StatusPillStatus>,
): Invoice[] {
  // Attach original index so "newest" = input order (already newest-first).
  let list = invoices.map((inv, i) => ({ ...inv, _i: i }))

  if (statuses.length > 0) {
    list = list.filter((inv) => (statuses as ReadonlyArray<string>).includes(inv.status))
  }

  const comparators: Record<DashSortId, (a: typeof list[0], b: typeof list[0]) => number> = {
    newest:  (a, b) => a._i - b._i,
    oldest:  (a, b) => b._i - a._i,
    amtHigh: (a, b) => parseRupeeString(b.amount) - parseRupeeString(a.amount),
    amtLow:  (a, b) => parseRupeeString(a.amount) - parseRupeeString(b.amount),
    nameAZ:  (a, b) => a.customer.localeCompare(b.customer),
  }

  const compare = comparators[sort] ?? comparators.newest

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return [...list].sort(compare).map(({ _i, ...rest }) => rest)
}
