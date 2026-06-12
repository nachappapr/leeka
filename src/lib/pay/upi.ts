import "server-only";
import QRCode from "qrcode";

export interface UpiIntentParams {
  payeeVpa: string;
  payeeName: string;
  /** Amount due in integer paise (e.g. 123456 = ₹1234.56). */
  amountPaise: number;
  note: string;
}

/**
 * Builds a UPI intent URI per §9.3:
 *   upi://pay?pa={vpa}&pn={name}&am={amount}&tn={note}&cu=INR
 *
 * amountPaise is converted to rupees using integer arithmetic to avoid
 * floating-point formatting drift (e.g. 50 → "0.50", 123456 → "1234.56").
 */
export function buildUpiIntent(params: UpiIntentParams): string {
  const { payeeVpa, payeeName, amountPaise, note } = params;

  // Integer arithmetic: avoid floating-point by working with whole rupees + paise remainder.
  const rupees = Math.floor(amountPaise / 100);
  const paise = amountPaise % 100;
  const amountStr = `${rupees}.${String(paise).padStart(2, "0")}`;

  return `upi://pay?pa=${payeeVpa}&pn=${encodeURIComponent(payeeName)}&am=${amountStr}&tn=${encodeURIComponent(note)}&cu=INR`;
}

/** Renders a UPI intent URI as an SVG QR code string. Server-only. */
export async function buildUpiQrSvg(intentUrl: string): Promise<string> {
  return QRCode.toString(intentUrl, { type: "svg" });
}
