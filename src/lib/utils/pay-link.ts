// Pay-link generator — stable per invoice ID (design spec: rzp.io/i/)
export function payLinkFor(invoiceId: string): string {
  const slug = invoiceId.replace(/\W/g, "").slice(-4) || "aBc8";
  return `rzp.io/i/${slug}nQ`;
}
