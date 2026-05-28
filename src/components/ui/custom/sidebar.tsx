"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useIsTablet } from "@/hooks/use-tablet";
import { LekkaLogo, Sparkles } from "@/components/icons";
import { Avatar, AvatarFallback } from "@/components/ui/primitives/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/primitives/sidebar";
import { PillButton } from "@/components/ui/custom/pill-button";
import { NAV_MAIN, NAV_ACCOUNT } from "@/components/ui/custom/sidebar-nav";
import { cn } from "@/lib/utils";

const navButtonClass = cn(
  "h-auto rounded-nav-item gap-3 px-3 py-2.5 font-semibold text-body-sm text-ink-2",
  "hover:bg-background hover:text-ink",
  "[&[data-active]_svg]:text-coral-press data-[active]:text-coral-ink",
  "group-data-[collapsible=icon]:mx-auto",
);

// A nav item is active when the current path equals its href OR sits beneath
// it as a child route. To prevent a broader href (/invoices) from claiming a
// sibling's specific path (/invoices/new), the broader item only matches when
// no other registered href is a longer prefix of the current path.
function isNavItemActive(
  href: string,
  pathname: string,
  allHrefs: ReadonlyArray<string>,
): boolean {
  if (pathname === href) return true;
  if (href === "/") return false;
  if (!pathname.startsWith(`${href}/`)) return false;
  return !allHrefs.some(
    (other) =>
      other !== href &&
      other.startsWith(`${href}/`) &&
      (pathname === other || pathname.startsWith(`${other}/`)),
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpen } = useSidebar();
  const isTablet = useIsTablet();
  const allHrefs = React.useMemo(
    () => [...NAV_MAIN, ...NAV_ACCOUNT].map((item) => item.href),
    [],
  );

  const setOpenRef = React.useRef(setOpen);
  React.useEffect(() => {
    setOpenRef.current = setOpen;
  });
  React.useEffect(() => {
    if (isTablet) setOpenRef.current(false);
  }, [isTablet]);

  return (
    <Sidebar collapsible="icon">
      {/* Brand */}
      <SidebarHeader className="p-3.5 pb-2 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:pt-5 group-data-[collapsible=icon]:pb-5">
        <div className="flex items-center gap-3 px-2 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-nav-item bg-coral shadow-coral group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:rounded-md">
            <LekkaLogo
              className="size-5 group-data-[collapsible=icon]:size-4"
              aria-hidden
            />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <div className="text-19 font-black tracking-snug text-ink">
              arthapatra<span className="text-coral">.</span>
            </div>
            <div className="text-11 font-semibold tracking-wide text-ink-3">
              Invoicing
            </div>
          </div>
          <SidebarTrigger className="ml-auto text-ink-3 hover:text-ink group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="group-data-[collapsible=icon]:pt-2">
        {/* Main group */}
        <SidebarGroup>
          <SidebarGroupLabel className="h-auto px-3 pb-1 text-kicker uppercase tracking-wider text-ink-3 font-black">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {NAV_MAIN.map((item) => {
                const isActive = isNavItemActive(item.href, pathname, allHrefs);
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.badge != null ? `${item.label} (${item.badge})` : item.label}
                      className={navButtonClass}
                      render={
                        <Link
                          href={item.href}
                          aria-current={isActive ? "page" : undefined}
                        />
                      }
                    >
                      <Icon className="size-4 shrink-0" aria-hidden />
                      <span className="flex-1">{item.label}</span>
                      {item.badge != null && (
                        <span className="ml-auto rounded-full bg-overdue px-2 py-px text-11 font-black text-white group-data-[collapsible=icon]:hidden">
                          {item.badge}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Account group */}
        <SidebarGroup>
          <SidebarGroupLabel className="h-auto px-3 pb-1 text-kicker uppercase tracking-wider text-ink-3 font-black">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {NAV_ACCOUNT.map((item) => {
                const isActive = isNavItemActive(item.href, pathname, allHrefs);
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.label}
                      className={navButtonClass}
                      render={
                        <Link
                          href={item.href}
                          aria-current={isActive ? "page" : undefined}
                        />
                      }
                    >
                      <Icon className="size-4 shrink-0" aria-hidden />
                      <span className="flex-1">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-3.5 pt-2 gap-3 group-data-[collapsible=icon]:p-2">
        {/* Upgrade banner — hidden when icon-only */}
        <div className="rounded-nav-item bg-linear-to-br from-coral-soft to-cream p-3 text-caption text-ink-2 group-data-[collapsible=icon]:hidden">
          <div className="mb-1 flex items-center gap-1.5 text-caption font-black text-ink">
            <Sparkles className="size-4 text-coral" aria-hidden />
            Upgrade to Pro
          </div>
          <p className="text-label leading-relaxed">
            Unlimited invoices, reminders &amp; reports for ₹99/mo
          </p>
          <PillButton tone="primary" size="sm" className="mt-2.5 w-full">
            See plans
          </PillButton>
        </div>

        {/* User row — centered when icon-only, full when expanded */}
        <div className="flex items-center gap-2.5 border-t border-sidebar-border px-2 pt-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:pt-0">
          <Avatar className="size-9 shrink-0">
            <AvatarFallback className="bg-coral! text-white! text-body-sm font-black tracking-wide">
              RK
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="truncate text-caption font-bold text-ink">
              Raj Kumar Trading
            </div>
            <div className="text-11 text-ink-3">Free plan</div>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
