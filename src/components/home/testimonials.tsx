import { TESTIMONIALS } from "@/lib/constants/home";
import { TestimonialCard } from "@/components/home/testimonial-card";

function Testimonials() {
  return (
    <section className="py-22 max-tablet:py-16 max-mobile:py-12 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-8 max-mobile:px-5">
        {/* Section head */}
        <div className="mx-auto mb-14 max-w-180 text-center">
          <span className="mb-2.5 inline-block text-12 font-extrabold uppercase tracking-widest text-coral-press">
            What vendors say
          </span>
          <h2 className="text-44 font-extrabold leading-tight tracking-tight max-mobile:text-32">
            Built with shop owners. Loved by shop owners.
          </h2>
        </div>

        {/* Testimonials grid — 3 col desktop, 2 col tablet (3rd spans both), 1 col mobile */}
        <div className="grid grid-cols-3 gap-5 max-tablet:grid-cols-2 max-mobile:grid-cols-1 [&>article:nth-child(3)]:max-tablet:col-span-2 [&>article:nth-child(3)]:max-mobile:col-span-1">
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

export { Testimonials };
