/** Format a rupee amount with Indian-locale grouping; paise only when present. */
export function formatAmount(amount: number): string {
  if (amount % 1 !== 0) {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  return new Intl.NumberFormat("en-IN").format(amount);
}

/** Pure relative-time formatter; server-safe (no browser APIs). */
export function relTime(ts: string | Date): string {
  const now = new Date();
  const then = typeof ts === "string" ? new Date(ts) : ts;
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "just now";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return then.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
