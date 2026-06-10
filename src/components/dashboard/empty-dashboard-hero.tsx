import Link from "next/link";
import { Plus, Users } from "@/components/icons";
import { cn } from "@/lib/utils";
import { pillButtonVariants } from "@/components/ui/custom/pill-button";

export function EmptyDashboardHero() {
  return (
    <section
      className="relative overflow-hidden rounded-md text-white shadow-coral-hero"
      // eslint-disable-next-line no-restricted-syntax -- multi-stop brand gradient; no single token covers a diagonal three-stop fill
      style={{
        background: "linear-gradient(135deg, #F46A39 0%, #D9531F 65%, #B83E12 100%)",
      }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <span className="absolute top-7 right-28 size-3.5 rounded-full bg-white/55 max-mobile:right-8 max-mobile:top-5" />
        <span className="absolute top-20 right-14 size-2 rounded-full bg-white/45 max-mobile:right-3.5 max-mobile:top-16" />
        <span className="absolute bottom-9 right-60 size-5 rounded-full bg-pending-bright shadow-[0_6px_20px_rgba(255,214,107,0.4)] max-mobile:hidden" />
        <span className="absolute -top-24 -right-24 size-64 rounded-full border-[1.5px] border-white/22" />
        <span className="absolute -bottom-16 -right-5 size-40 rounded-full border-[1.5px] border-white/18" />
      </div>

      <div className="relative max-w-160 px-10 pt-9 pb-10 max-mobile:max-w-full max-mobile:px-5 max-mobile:pt-7 max-mobile:pb-7">
        <div className="inline-flex items-center gap-2 rounded-full bg-black/18 px-3 py-1.5 text-kicker font-extrabold uppercase tracking-wider">
          <span className="size-2 rounded-full bg-pending-bright ring-4 ring-pending-bright/25" />
          Welcome to ArthaPatra
        </div>

        <h1 className="mt-3.5 mb-2.5 text-h1 font-extrabold tracking-tight">
          Namaste, Raj{" "}
          <span aria-hidden="true" className="inline-block -rotate-6">
            👋
          </span>
        </h1>

        <p className="max-w-135 text-body font-medium leading-relaxed text-white/92">
          Send your first invoice in under a minute. We&rsquo;ll keep track of who&rsquo;s paid,
          who&rsquo;s viewed, and who needs a nudge — so you can focus on your shop.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3 max-mobile:gap-2">
          <Link
            href="/invoices/new"
            className={cn(
              pillButtonVariants({ tone: "onCoral", size: "lg" }),
              "shadow-[0_6px_16px_rgba(0,0,0,0.18)] max-mobile:w-full max-mobile:justify-center",
            )}
          >
            <Plus className="size-5" aria-hidden />
            Create your first invoice
          </Link>
          <Link
            href="/customers"
            className={cn(
              pillButtonVariants({ tone: "ghost", size: "md" }),
              "text-white hover:bg-white/15 max-mobile:w-full max-mobile:justify-center",
            )}
          >
            <Users className="size-4" aria-hidden />
            Add a customer instead
          </Link>
        </div>
      </div>
    </section>
  );
}
