import { cn } from "@/lib/utils";

interface NotificationCountProps {
  count: number;
  max?: number;
  className?: string;
}

function NotificationCount({ count, max = 99, className }: NotificationCountProps) {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : `${count}`;
  const label = `${displayCount} new`;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex items-center justify-center",
        "px-2 py-0.5",
        "rounded-full",
        "bg-coral-soft text-coral-ink",
        "font-sans font-bold",
        "text-kicker leading-none align-middle",
        className,
      )}
    >
      {label}
    </span>
  );
}

export { NotificationCount };
