import Link from "next/link";
import { Plus, Users, Receipt, Bell, IndianRupee, Check, Clock } from "@/components/icons";
import { cn } from "@/lib/utils";
import { pillButtonVariants } from "@/components/ui/custom/pill-button";

const ICON_MAP = {
  Plus,
  Users,
  Receipt,
  Bell,
  IndianRupee,
  Check,
  Clock,
};

export type EmptyTableIconName = keyof typeof ICON_MAP;

interface ActionConfig {
  label: string;
  href: string;
  icon?: EmptyTableIconName;
}

interface EmptyTableStateProps {
  icon: EmptyTableIconName;
  title: string;
  body: string;
  primary?: ActionConfig;
  secondary?: ActionConfig;
  headingLevel?: 2 | 3;
}

export function EmptyTableState({
  icon,
  title,
  body,
  primary,
  secondary,
  headingLevel = 2,
}: EmptyTableStateProps) {
  const IconComponent = ICON_MAP[icon];
  const PrimaryIcon = primary?.icon ? ICON_MAP[primary.icon] : null;
  const Heading = `h${headingLevel}` as "h2" | "h3";

  return (
    <section
      aria-label={title}
      className="flex flex-col items-center pt-14 px-6 pb-16 text-center max-mobile:pt-9 max-mobile:px-4.5 max-mobile:pb-11"
    >
      <div
        aria-hidden="true"
        className="relative mb-5 flex size-33 items-center justify-center max-mobile:size-27 max-mobile:mb-4"
      >
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, var(--color-coral-soft) 0%, rgba(255,231,218,0) 75%)",
          }}
        />
        <span className="absolute left-1/2 top-7.5 h-2 w-13 -translate-x-1/2 rounded-sm bg-line opacity-60" />
        <span className="absolute left-1/2 top-11.5 h-2 w-19.5 -translate-x-1/2 rounded-sm bg-line opacity-85" />
        <span className="absolute left-1/2 top-15.5 h-2 w-16 -translate-x-1/2 rounded-sm bg-line opacity-70" />
        <span className="relative z-1 mt-6 flex size-16 items-center justify-center rounded-[20px] border border-line bg-surface shadow-card">
          <IconComponent className="size-7 text-coral" aria-hidden />
        </span>
      </div>

      <Heading className="text-title font-extrabold tracking-snug text-ink">{title}</Heading>
      <p className="mt-2 max-w-105 text-body-sm font-medium leading-relaxed text-ink-3">{body}</p>

      {(primary || secondary) && (
        <div className="mt-5 flex flex-wrap justify-center gap-2.5 max-mobile:w-full">
          {primary && (
            <Link
              href={primary.href}
              className={cn(
                pillButtonVariants({ tone: "primary", size: "md" }),
                "max-mobile:flex-1",
              )}
            >
              {PrimaryIcon && <PrimaryIcon className="size-4" aria-hidden />}
              {primary.label}
            </Link>
          )}
          {secondary && (
            <Link
              href={secondary.href}
              className={cn(
                pillButtonVariants({ tone: "outline", size: "md" }),
                "max-mobile:flex-1",
              )}
            >
              {secondary.label}
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
