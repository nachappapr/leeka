"use client";

import { useEffect, useRef, type RefObject } from "react";
import Link from "next/link";

import {
  LekkaLogo,
  XIcon,
  Sparkles,
  PlayCircle,
  Receipt,
  HelpCircle,
  FileText,
  Globe,
} from "@/components/icons";
import { PillButton } from "@/components/ui/custom/pill-button";
import { cn } from "@/lib/utils";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}

const drawerLinks = [
  { icon: Sparkles, label: "Features", href: "#features" },
  { icon: PlayCircle, label: "How it works", href: "#how" },
  { icon: Receipt, label: "Pricing", href: "#pricing" },
  { icon: HelpCircle, label: "FAQ", href: "#faq" },
  { icon: FileText, label: "Documentation", href: "#" },
] as const;

function MobileDrawer({ open, onClose, triggerRef }: MobileDrawerProps) {
  const panelRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const wasOpenRef = useRef(false);

  // Escape key handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Focus management: focus close button on open, restore to trigger on close
  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus();
      wasOpenRef.current = true;
    } else if (wasOpenRef.current) {
      triggerRef.current?.focus();
      wasOpenRef.current = false;
    }
  }, [open, triggerRef]);

  // Focus trap: wrap Tab/Shift+Tab within the drawer
  useEffect(() => {
    if (!open) return;
    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", handleTab);
    return () => window.removeEventListener("keydown", handleTab);
  }, [open]);

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 transition-colors duration-300 motion-reduce:transition-none",
          open
            ? "bg-ink/50 pointer-events-auto"
            : "bg-transparent pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <aside
        id="mobile-drawer"
        ref={panelRef}
        role="dialog"
        aria-modal={open}
        aria-label="Site navigation"
        inert={!open}
        className={cn(
          "fixed top-0 right-0 bottom-0 z-50 w-[84%] max-w-80 bg-card shadow-2xl",
          "flex flex-col p-5 pt-4 pb-7",
          "transform transition-transform duration-300 ease-out motion-reduce:transition-none",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Drawer head */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-nav-item bg-coral shadow-coral">
              <LekkaLogo className="size-5" />
            </div>
            <span className="text-20 font-extrabold tracking-tight">
              arthapatra<span className="text-coral">.</span>
            </span>
          </div>
          <button
            type="button"
            ref={closeButtonRef}
            aria-label="Close menu"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-full border border-border bg-background text-ink-2 transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        {/* Drawer links */}
        <nav className="flex flex-1 flex-col gap-0.5 py-4">
          {drawerLinks.map(({ icon: Icon, label, href }) => (
            <a
              key={href + label}
              href={href}
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-3 py-3.5 text-17 font-bold text-ink transition-colors hover:bg-background"
            >
              <Icon className="size-5 text-coral" />
              {label}
            </a>
          ))}
        </nav>

        {/* Drawer footer */}
        <div className="flex flex-col gap-2.5 border-t border-border pt-4">
          {/* Language row */}
          <div className="flex items-center gap-2 rounded-xl bg-background px-3 py-2.5">
            <Globe className="size-4 text-ink-2" />
            <span className="flex-1 text-body-sm font-bold text-ink-2">
              Language
            </span>
            <span className="font-extrabold text-coral-press">
              EN / <span lang="hi">हिं</span>
            </span>
          </div>

          <PillButton
            tone="outline"
            size="md"
            className="w-full"
            render={<Link href="/dashboard" onClick={onClose} />}
          >
            Log in
          </PillButton>

          <PillButton
            tone="primary"
            size="lg"
            className="w-full"
            render={<Link href="/dashboard" onClick={onClose} />}
          >
            Get started free
          </PillButton>
        </div>
      </aside>
    </>
  );
}

export { MobileDrawer };
