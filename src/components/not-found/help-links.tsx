import Link from "next/link";
import { FileText, HelpCircle } from "@/components/icons";
import { cn } from "@/lib/utils";

const links = [
  { href: "/invoices/new", icon: FileText, label: "New invoice" },
  { href: "/#faq", icon: FileText, label: "Documentation" },
  { href: "/#faq", icon: HelpCircle, label: "FAQ" },
] as const;

const helpLinkClass = cn(
  "inline-flex items-center gap-2 h-10 px-3.5 rounded-full",
  "bg-card border border-ink-3 text-caption font-bold text-ink-2",
  "transition-[border-color,color,background-color] duration-150",
  "hover:border-ink-2 hover:text-ink hover:bg-surface-2",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2",
);

function HelpLinks() {
  return (
    <div className="mt-9 pt-6 border-t border-line max-mobile:mt-7 max-mobile:pt-5">
      <p className="mb-3 text-kicker font-extrabold uppercase tracking-wider text-ink-3">
        Or jump to
      </p>
      <div className="flex flex-wrap gap-2">
        {links.map(({ href, icon: Icon, label }) => (
          <Link key={label} href={href} className={helpLinkClass}>
            <Icon className="size-3.5 text-coral-press shrink-0" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export { HelpLinks };
