import { Star } from "@/components/icons"
import type { Testimonial } from "@/lib/types/home"

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article className="flex flex-col rounded-2xl bg-card p-6 shadow-card">
      {/* Star rating */}
      <div
        className="mb-3 flex gap-0.5"
        aria-label={`${testimonial.rating} out of 5 stars`}
      >
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star
            key={i}
            className="size-4 fill-amber-400 text-amber-400"
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Quote */}
      <p className="flex-1 text-body font-medium leading-snug text-ink">
        {testimonial.quote}
      </p>

      {/* Author cluster */}
      <div className="mt-4.5 flex items-center gap-2.5 border-t border-border pt-4">
        <div className="flex size-10 items-center justify-center rounded-full bg-coral-soft text-14 font-extrabold text-coral-ink">
          {testimonial.initials}
        </div>
        <div>
          <div className="text-14 font-extrabold text-ink">
            {testimonial.author}
          </div>
          <div className="text-12 text-ink-3">
            {testimonial.role} · {testimonial.location}
          </div>
        </div>
      </div>
    </article>
  )
}

export { TestimonialCard }
