import { ChevronDownIcon } from "@/components/icons"
import type { Faq } from "@/lib/types/home"

function FaqItem({ faq, defaultOpen = false }: { faq: Faq; defaultOpen?: boolean }) {
  return (
    <details
      open={defaultOpen}
      className="group overflow-hidden rounded-lg border border-border bg-card"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-5.5 py-4.5 text-16 font-bold text-ink [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2">
        {faq.question}
        <ChevronDownIcon
          className="ml-auto size-5 shrink-0 text-coral-press transition-transform group-open:rotate-180 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </summary>
      <p className="px-5.5 pb-4.5 text-15 leading-relaxed text-ink-2">{faq.answer}</p>
    </details>
  )
}

export { FaqItem }
