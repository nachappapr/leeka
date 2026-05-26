import { formatAmount } from "./notifications"

/** Format a rupee amount with the ₹ prefix and Indian-locale grouping. */
export function formatRupees(amount: number): string {
  return `₹${formatAmount(amount)}`
}
