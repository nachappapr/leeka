import { formatAmount } from "./notifications";

/** Format a rupee amount with the ₹ prefix and Indian-locale grouping. */
export function formatRupees(amount: number): string {
  return `₹${formatAmount(amount)}`;
}

/** Convert an integer paise value to a ₹-prefixed Indian-locale string. */
export function formatPaise(paise: number): string {
  return formatRupees(paise / 100);
}
