import { Ban } from "@/components/icons";

export function InvoiceActionsCancelled() {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3 text-body-sm text-muted-foreground">
      <Ban className="size-4 shrink-0" aria-hidden />
      <span>This invoice is cancelled and can&apos;t be acted on.</span>
    </div>
  );
}
