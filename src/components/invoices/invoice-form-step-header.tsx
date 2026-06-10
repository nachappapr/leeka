import { Check } from "@/components/icons";
import { cn } from "@/lib/utils";

interface InvoiceFormStepHeaderProps {
  n: number;
  title: string;
  hint?: string;
  done?: boolean;
}

export function InvoiceFormStepHeader({ n, title, hint, done }: InvoiceFormStepHeaderProps) {
  return (
    <div className="flex items-start gap-3 mb-3.5">
      <div
        className={cn(
          "flex size-7.5 shrink-0 items-center justify-center rounded-full text-body-sm font-extrabold text-primary-foreground shadow-press",
          done ? "bg-paid" : "bg-primary",
        )}
      >
        {done ? <Check className="size-4" strokeWidth={3} aria-hidden /> : n}
      </div>
      <div className="min-w-0 flex-1 pt-px">
        <h3 className="m-0 text-title-sm font-extrabold text-ink">{title}</h3>
        {hint && <p className="mt-0.5 text-caption font-medium text-ink-3">{hint}</p>}
      </div>
    </div>
  );
}
