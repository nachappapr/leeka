export interface SetupStep {
  key: string;
  done: boolean;
  label: string;
  hint: string;
  action: {
    label: string;
    href: string;
    primary?: boolean;
  } | null;
}

export interface PreviewTile {
  icon: "IndianRupee" | "Check" | "Clock";
  label: string;
  hint: string;
  bgClass: string;
  inkClass: string;
}

export interface QuickAction {
  icon: "Receipt" | "Users" | "WhatsApp";
  title: string;
  sub: string;
  href: string;
  bgClass: string;
  inkClass: string;
}
