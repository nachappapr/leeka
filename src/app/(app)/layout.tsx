import { cookies } from "next/headers";

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/primitives/sidebar";
import { AppSidebar } from "@/components/ui/custom/sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      // eslint-disable-next-line no-restricted-syntax
      style={{ "--sidebar-width": "15rem", "--sidebar-width-icon": "4.75rem" } as React.CSSProperties}
      className="bg-background"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:text-body-sm focus:font-bold focus:text-ink focus:ring-2 focus:ring-coral-press focus:shadow-float"
      >
        Skip to main content
      </a>
      <AppSidebar />
      <SidebarInset id="main-content">{children}</SidebarInset>
    </SidebarProvider>
  );
}
