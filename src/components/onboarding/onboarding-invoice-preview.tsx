import { cn } from "@/lib/utils";
import { INDIA_STATES } from "@/lib/constants/business";

interface OnboardingInvoicePreviewProps {
  name: string;
  address: string;
  stateCode: string;
  gstin: string;
  upiId: string;
}

function OnboardingInvoicePreview({
  name,
  address,
  stateCode,
  gstin,
  upiId,
}: OnboardingInvoicePreviewProps) {
  const hasName = name.trim().length > 0;
  const hasGstin = gstin.trim().length > 0;
  const hasUpi = upiId.trim().length > 0;

  const stateName = INDIA_STATES.find((s) => s.code === stateCode)?.name ?? "";
  const addrParts: string[] = [];
  if (address.trim()) addrParts.push(address.trim());
  if (stateName) addrParts.push(stateName);
  const hasAddr = addrParts.length > 0;

  const logoInitial = hasName ? name.trim()[0]!.toUpperCase() : "B";

  return (
    <aside
      className="sticky top-0 flex h-screen flex-col items-center self-start overflow-y-auto justify-center border-l border-line bg-surface-2 px-12 py-10 [background-image:radial-gradient(120%_80%_at_100%_0%,rgba(244,106,57,0.10)_0%,transparent_55%)] max-tablet:static max-tablet:h-auto max-tablet:overflow-visible max-tablet:border-l-0 max-tablet:border-t max-tablet:px-10 max-tablet:py-8 max-mobile:hidden"
      aria-hidden="true"
    >
      <div className="mb-5 inline-flex items-center gap-2 text-caption font-bold text-ink-3">
        <span className="size-2 rounded-full bg-paid animate-pulse motion-reduce:animate-none" />
        Live preview · how your invoice looks
      </div>

      <div className="w-full max-w-100 rounded-2xl border border-line bg-white shadow-float max-tablet:max-w-115">
        <div className="p-6 pb-5.5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div
                className={cn(
                  "flex size-11 items-center justify-center rounded-xl font-extrabold text-19 text-white",
                  hasName ? "bg-coral" : "bg-line-strong",
                )}
              >
                {logoInitial}
              </div>
              <div
                className={cn(
                  "mt-2.5 text-17 font-extrabold leading-tight tracking-tight",
                  hasName ? "text-ink" : "text-line-strong",
                )}
              >
                {hasName ? name.trim() : "Your business name"}
              </div>
              <div
                className={cn(
                  "mt-0.5 text-12 leading-relaxed whitespace-pre-line",
                  hasAddr ? "text-ink-3" : "text-line-strong",
                )}
              >
                {hasAddr ? addrParts.join("\n") : "Street, city, pincode"}
              </div>
              <div
                className={cn(
                  "mt-1 font-mono text-11 font-semibold tracking-wide",
                  hasGstin ? "text-ink-3" : "text-line-strong",
                )}
              >
                {hasGstin ? `GSTIN ${gstin.trim()}` : "GSTIN —"}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-10 font-extrabold uppercase tracking-wider text-ink-3">
                Invoice
              </div>
              <div className="mt-0.5 font-mono text-15 font-extrabold text-coral">INV-025</div>
              <div className="mt-0.5 text-11 text-ink-3">15 Jun 2026</div>
            </div>
          </div>

          <hr className="my-4 h-px border-0 bg-line" />

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <div className="text-9 font-extrabold uppercase tracking-wider text-ink-3">
                Billed to
              </div>
              <div className="mt-1 text-12 font-bold text-ink">Sharma Sweets</div>
              <div className="text-11 text-ink-3">+91 98XXX 12345</div>
            </div>
            <div>
              <div className="text-9 font-extrabold uppercase tracking-wider text-ink-3">Due</div>
              <div className="mt-1 text-12 font-bold text-ink">15 Jun 2026</div>
            </div>
          </div>

          <div className="mt-3.5 rounded-lg bg-background px-3 py-1.5">
            <div className="flex items-start justify-between gap-2.5 py-1.5 text-12">
              <div>
                <div className="font-semibold text-ink">Premium Mithai Box · 500g</div>
                <div className="mt-px text-11 text-ink-3">4 × ₹850</div>
              </div>
              <div className="shrink-0 font-bold tabular-nums text-ink">₹3,400</div>
            </div>
            <div className="flex items-start justify-between gap-2.5 border-t border-dashed border-line py-1.5 text-12">
              <div>
                <div className="font-semibold text-ink">Kaju Katli · 250g</div>
                <div className="mt-px text-11 text-ink-3">2 × ₹550</div>
              </div>
              <div className="shrink-0 font-bold tabular-nums text-ink">₹1,100</div>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-1">
            <div className="flex justify-between text-12 text-ink-3">
              <span>Subtotal</span>
              <span className="tabular-nums">₹4,500</span>
            </div>
            <div className="flex justify-between text-12 text-ink-3">
              <span>GST · 5%</span>
              <span className="tabular-nums">₹225</span>
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between rounded-lg bg-coral px-3.5 py-2.5 text-white">
            <span className="text-11 font-extrabold uppercase tracking-wide text-white/90">
              Total due
            </span>
            <span className="text-22 font-extrabold tabular-nums tracking-tight">₹4,725</span>
          </div>

          <div
            className={cn(
              "mt-3 flex items-center gap-2.5 rounded-lg px-3 py-2.5",
              hasUpi ? "bg-paid-soft" : "bg-surface-2",
            )}
          >
            <div
              className={cn(
                "flex size-7.5 shrink-0 items-center justify-center rounded-lg bg-white font-mono text-9 font-bold shadow-card",
                hasUpi ? "text-paid-ink" : "text-line-strong",
              )}
            >
              UPI
            </div>
            <div className="min-w-0">
              <div
                className={cn(
                  "text-10 font-extrabold uppercase tracking-wide",
                  hasUpi ? "text-paid-ink" : "text-line-strong",
                )}
              >
                Pay by UPI
              </div>
              <div
                className={cn(
                  "truncate text-12 font-bold",
                  hasUpi ? "text-ink" : "text-line-strong",
                )}
              >
                {hasUpi ? upiId.trim() : "Add a UPI ID"}
              </div>
            </div>
          </div>

          <div className="mt-3.5 text-center text-11 italic text-ink-3">
            Thank you for your business!
          </div>
        </div>
      </div>

      <p className="mt-5 max-w-100 text-center text-caption leading-relaxed text-ink-3">
        Everything you enter on the left updates this invoice in real time — the same layout your
        customers receive. You can change all of it later in Settings.
      </p>
    </aside>
  );
}

export { OnboardingInvoicePreview };
