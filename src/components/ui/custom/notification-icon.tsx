import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Info,
  WhatsApp,
  Users,
  Edit,
  Share,
} from "@/components/icons";
import type { ComponentType, SVGProps } from "react";
import type { NotificationTone } from "@/lib/types/notifications";

type ToneConfig = {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  bgClass: string;
  fgClass: string;
};

const TONE_MAP: Record<NotificationTone, ToneConfig> = {
  paid: {
    Icon: CheckCircle2,
    bgClass: "bg-paid-soft",
    fgClass: "text-paid",
  },
  pending: {
    Icon: Clock,
    bgClass: "bg-pending-soft",
    fgClass: "text-pending-bar",
  },
  overdue: {
    Icon: AlertCircle,
    bgClass: "bg-overdue-soft",
    fgClass: "text-overdue",
  },
  info: {
    Icon: Info,
    bgClass: "bg-info-soft",
    fgClass: "text-info",
  },
  whatsapp: {
    Icon: WhatsApp,
    bgClass: "bg-whatsapp-soft",
    fgClass: "text-whatsapp-icon",
  },
  customer: {
    Icon: Users,
    bgClass: "bg-coral-soft",
    fgClass: "text-coral-ink",
  },
  draft: {
    Icon: Edit,
    bgClass: "bg-draft-soft",
    fgClass: "text-draft-ink",
  },
  sent: {
    Icon: Share,
    bgClass: "bg-pending-soft",
    fgClass: "text-pending-ink",
  },
};

interface NotificationIconProps {
  tone: NotificationTone;
  className?: string;
  "aria-hidden"?: boolean;
}

function NotificationIcon({
  tone,
  className,
  "aria-hidden": ariaHidden = true,
}: NotificationIconProps) {
  const { Icon, bgClass, fgClass } = TONE_MAP[tone];

  return (
    <span
      aria-hidden={ariaHidden}
      className={cn(
        "inline-flex items-center justify-center shrink-0",
        "w-9 h-9",
        "rounded-md",
        bgClass,
        fgClass,
        className,
      )}
    >
      <Icon className="w-5 h-5" />
    </span>
  );
}

export { NotificationIcon };
