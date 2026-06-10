function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 5) return d;
  return d.slice(0, 5) + " " + d.slice(5);
}

function validPhone(p: string) {
  return p.replace(/\D/g, "").length === 10;
}

function toE164(tenDigit: string): string {
  return `+91${tenDigit.replace(/\D/g, "")}`;
}

function padTime(n: number) {
  return String(n).padStart(2, "0");
}

export { formatPhone, validPhone, toE164, padTime };
