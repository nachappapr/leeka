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

function formatE164ForDisplay(e164: string): string {
  const digits = e164.replace(/\D/g, "");
  // E.164 includes country code prefix — take the last 10 digits to strip it
  if (digits.length < 10) return e164;
  const local = digits.slice(-10);
  return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
}

function padTime(n: number) {
  return String(n).padStart(2, "0");
}

export { formatPhone, validPhone, toE164, formatE164ForDisplay, padTime };
