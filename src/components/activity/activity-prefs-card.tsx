import Link from "next/link";
import { Bell } from "@/components/icons";
import { Card } from "@/components/ui/custom/card";
import { pillButtonVariants } from "@/components/ui/custom/pill-button";

export function ActivityPrefsCard() {
  return (
    <Card title="Stay in the loop" headingLevel={3}>
      <div className="px-6 py-4 flex flex-col gap-4">
        <p className="text-caption text-ink-2 leading-relaxed">
          Get instant pings when a customer pays or opens an invoice. Configure channels in
          settings.
        </p>
        <Link
          href="/settings"
          className={pillButtonVariants({ tone: "primary", size: "md" }) + " w-full"}
        >
          <Bell className="size-4" aria-hidden />
          Notification preferences
        </Link>
      </div>
    </Card>
  );
}
