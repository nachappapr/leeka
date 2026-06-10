import { Check, WhatsApp } from "@/components/icons";

function HeroFloatingCards() {
  return (
    <div className="pointer-events-none max-mobile:hidden" aria-hidden="true">
      {/* Paid card — top-left, overlapping browser top-left corner */}
      <div className="absolute -top-5.5 -left-7 z-20 flex min-w-52 items-center gap-2.5 rounded-2xl bg-card px-3.5 py-3 shadow-float animate-float-y">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-paid text-card">
          <Check className="size-4.5" strokeWidth={2.6} aria-hidden="true" />
        </div>
        <div>
          <div className="text-12 font-extrabold text-ink">+ &#8377;4,725 received</div>
          <div className="text-11 text-ink-3">Sharma Sweets &middot; just now</div>
        </div>
      </div>

      {/* WhatsApp card — bottom-right, overlapping browser bottom-right */}
      <div className="absolute bottom-7.5 -right-8 z-20 flex min-w-52 items-center gap-2.5 rounded-2xl bg-card px-3.5 py-3 shadow-float animate-float-y-reverse">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-whatsapp-icon text-card">
          <WhatsApp className="size-4.5" aria-hidden="true" />
        </div>
        <div>
          <div className="text-12 font-extrabold text-ink">Invoice delivered ✓</div>
          <div className="text-11 text-ink-3">Sent on WhatsApp &middot; viewed</div>
        </div>
      </div>
    </div>
  );
}

export { HeroFloatingCards };
