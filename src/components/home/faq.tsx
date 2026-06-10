import { FAQS } from "@/lib/constants/home";
import { FaqItem } from "@/components/home/faq-item";

function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 py-22 max-tablet:py-16 max-mobile:py-12">
      <div className="mx-auto max-w-7xl px-8 max-mobile:px-5">
        {/* Section head */}
        <div className="mx-auto mb-14 max-w-180 text-center">
          <span className="mb-2.5 inline-block text-12 font-extrabold uppercase tracking-widest text-coral-press">
            Frequently asked
          </span>
          <h2 className="text-44 font-extrabold leading-tight tracking-tight max-mobile:text-32">
            Good questions, honest answers.
          </h2>
        </div>

        {/* Accordion list */}
        <div className="mx-auto flex max-w-200 flex-col gap-3">
          {FAQS.map((faq, i) => (
            <FaqItem key={faq.id} faq={faq} defaultOpen={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}

export { Faq };
