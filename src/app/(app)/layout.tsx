import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SidebarInset, SidebarProvider } from "@/components/ui/primitives/sidebar";
import { AppSidebar } from "@/components/ui/custom/sidebar";
import { getBusinessForUser } from "@/lib/data/business";
import { getInvoiceStatusCounts } from "@/lib/data/invoice";
import { initials } from "@/lib/utils";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [cookieStore, business, statusCounts] = await Promise.all([
    cookies(),
    getBusinessForUser(),
    getInvoiceStatusCounts(),
  ]);

  // Authenticated but onboarding unfinished (no business yet) — finish the
  // wizard before any app surface renders. This is the single completeness gate
  // for every protected page in the (app) group.
  if (!business) {
    redirect("/onboarding");
  }

  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  const businessName = business?.name ?? "Your business";
  const planLabel = business?.plan === "pro" ? "Pro plan" : "Free plan";
  const avatarInitials = initials(businessName);
  const overdueCount = statusCounts.overdue ?? 0;

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      // eslint-disable-next-line no-restricted-syntax
      style={
        { "--sidebar-width": "15rem", "--sidebar-width-icon": "4.75rem" } as React.CSSProperties
      }
      className="bg-background"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:text-body-sm focus:font-bold focus:text-ink focus:ring-2 focus:ring-coral-press focus:shadow-float"
      >
        Skip to main content
      </a>
      <AppSidebar
        businessName={businessName}
        planLabel={planLabel}
        initials={avatarInitials}
        invoiceBadge={overdueCount > 0 ? overdueCount : undefined}
      />
      <SidebarInset id="main-content">{children}</SidebarInset>
    </SidebarProvider>
  );
}
