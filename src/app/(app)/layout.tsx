import { Suspense } from "react";

import { AppShell } from "@/components/ui/custom/app-shell";
import { AppShellFallback } from "@/components/ui/custom/app-shell-fallback";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AppShellFallback />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
