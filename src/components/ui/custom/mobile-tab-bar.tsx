import { MOBILE_TABS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function MobileTabBar() {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] min-mobile:hidden"
    >
      {MOBILE_TABS.map((tab) =>
        tab.isPrimary ? (
          <button
            key="new"
            type="button"
            aria-label="New invoice"
            className="-mt-4 mx-auto flex h-14 w-14 items-center justify-center self-center rounded-full bg-coral shadow-coral"
          >
            <tab.icon className="size-6 text-white" aria-hidden />
          </button>
        ) : (
          <button
            key={tab.label}
            type="button"
            aria-label={tab.label}
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-2 text-xs font-bold",
              tab.active ? "text-coral" : "text-ink-3",
            )}
          >
            <tab.icon className="size-5" aria-hidden />
            <span>{tab.label}</span>
          </button>
        ),
      )}
    </nav>
  );
}
