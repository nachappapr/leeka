"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { Check } from "@/components/icons";
import { PillButton } from "@/components/ui/custom/pill-button";
import { brandToast } from "@/components/ui/custom/brand-toast";
import { markAllNotificationsRead } from "@/app/(app)/activity/actions";

interface MarkAllReadButtonProps {
  focusAfterId?: string;
}

export function MarkAllReadButton({ focusAfterId }: MarkAllReadButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await markAllNotificationsRead();
      if (result.ok) {
        brandToast.success({ title: "All notifications marked as read" });
        if (focusAfterId) {
          document.getElementById(focusAfterId)?.focus();
        }
        router.refresh();
      } else {
        brandToast.error({ title: result.error });
      }
    });
  }

  return (
    <PillButton tone="outline" size="sm" disabled={isPending} onClick={handleClick}>
      <Check className="size-4" aria-hidden />
      Mark all read
    </PillButton>
  );
}
