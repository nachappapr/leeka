import type { ComponentType } from "react";
import {
  LayoutDashboard,
  FileText,
  Bell,
  Plus,
  Users,
  BarChart2,
  Settings,
  LekkaLogo,
} from "@/components/icons";

function SideItem({
  icon: Icon,
  label,
  active,
  badge,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  active?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-12 font-semibold cursor-default ${
        active ? "bg-coral-soft text-coral-ink font-bold" : "text-ink-2"
      }`}
    >
      <Icon
        className={`size-3.5 shrink-0 ${active ? "text-coral" : "text-ink-3"}`}
        strokeWidth={2}
      />
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="bg-overdue text-card text-9 font-extrabold rounded-full px-1.5 py-px">
          {badge}
        </span>
      )}
    </div>
  );
}

function BrowserSidebar() {
  return (
    <aside className="hidden min-mobile:flex flex-col border-r border-border bg-background p-4 gap-1">
      {/* Brand cluster */}
      <div className="flex items-center gap-2.5 pb-3.5 border-b border-border mb-2.5">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-coral shadow-coral">
          <LekkaLogo className="size-4" />
        </div>
        <div className="flex flex-col leading-none">
          <strong className="text-14 font-extrabold">
            arthapatra<span className="text-coral">.</span>
          </strong>
          <small className="text-10 text-ink-3 font-semibold mt-0.5">Invoicing</small>
        </div>
      </div>

      {/* Main section */}
      <div className="text-kicker text-ink-3 px-2 pt-2 pb-1">Main</div>
      <SideItem icon={LayoutDashboard} label="Dashboard" active />
      <SideItem icon={FileText} label="Invoices" badge="4" />
      <SideItem icon={Bell} label="Activity" />
      <SideItem icon={Plus} label="New invoice" />
      <SideItem icon={Users} label="Customers" />
      <SideItem icon={BarChart2} label="Reports" />

      {/* Account section */}
      <div className="text-kicker text-ink-3 px-2 pt-2 pb-1 mt-1.5">Account</div>
      <SideItem icon={Settings} label="Settings" />
    </aside>
  );
}

export { BrowserSidebar };
