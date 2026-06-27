export function AppShellFallback() {
  return (
    <div className="flex min-h-svh w-full bg-background">
      <div className="w-60 shrink-0 border-r border-sidebar-border bg-sidebar max-mobile:hidden" />
      <div className="flex-1" />
    </div>
  );
}
