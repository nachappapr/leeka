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
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
