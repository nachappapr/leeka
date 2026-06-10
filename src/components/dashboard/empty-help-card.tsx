import { ChevronRight, WhatsApp } from "@/components/icons";

export function EmptyHelpCard() {
  return (
    <div
      className="flex gap-3.5 rounded-xl p-6 shadow-card"
      // eslint-disable-next-line no-restricted-syntax -- dark warm gradient card; no token covers this multi-stop dark brown diagonal
      style={{
        background: "linear-gradient(135deg, #1F1A14 0%, #3D2D1E 100%)",
      }}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-whatsapp shadow-[0_4px_12px_rgba(37,211,102,0.35)]">
        <WhatsApp className="size-5 text-white" aria-hidden />
      </span>

      <div>
        <p className="text-body font-extrabold text-white">Need a hand getting started?</p>
        <p className="mt-1 text-caption font-medium leading-relaxed text-white/75">
          Message us on WhatsApp — we&rsquo;ll walk you through your first invoice in Hindi or
          English.
        </p>
        <a
          href="https://wa.me/910000000000"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2.5 inline-flex items-center gap-1 text-caption font-extrabold text-pending-bright hover:underline"
        >
          Chat with us
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="sr-only"> (opens in new tab)</span>
        </a>
      </div>
    </div>
  );
}
