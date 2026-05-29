"use client";

// ── ArthaPatra brand Modal ────────────────────────────────────────────────────
// Compound family — all slots live here, mirroring sheet.tsx / data-table.tsx
// conventions. Wraps the Dialog primitive from primitives/dialog.tsx.
//
// Slots exported:
//   Modal           — root (pass open / onOpenChange)
//   ModalContent    — backdrop + popup with brand chrome
//   ModalHeader     — padded header container
//   ModalTitle      — DialogTitle in brand type
//   ModalDescription — DialogDescription in brand type
//   ModalClose      — round close button in brand style
//   ModalBody       — scrollable body
//   ModalFooter     — sticky footer with top border
// ─────────────────────────────────────────────────────────────────────────────

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/primitives/dialog";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "@/components/icons";

// ── Root ──────────────────────────────────────────────────────────────────────
function Modal({ ...props }: DialogPrimitive.Root.Props) {
  return <Dialog data-slot="modal" {...props} />;
}

// ── Backdrop + Popup (the main chrome) ───────────────────────────────────────
function ModalContent({
  className,
  children,
  ...props
}: DialogPrimitive.Popup.Props) {
  return (
    <DialogPortal>
      {/* Backdrop: warm ink tint + blur */}
      <DialogOverlay
        className={cn(
          "fixed inset-0 z-80 bg-ink/40",
          "supports-backdrop-filter:backdrop-blur-xs",
          // Enter / exit animations via Base UI data attributes
          "data-starting-style:opacity-0 data-ending-style:opacity-0",
          "transition-opacity duration-200 motion-reduce:transition-none",
        )}
      />
      {/* Popup: centered on desktop, bottom-anchored on mobile */}
      <DialogPrimitive.Popup
        data-slot="modal-content"
        className={cn(
          // ── Desktop: centered ──────────────────────────────────────────
          "fixed z-81 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          "w-[min(560px,calc(100vw-32px))] max-h-[calc(100vh-48px)]",
          "flex flex-col overflow-hidden outline-none",
          "bg-card rounded-2xl",
          "shadow-[0_28px_64px_rgba(63,40,16,0.28),0_0_0_1px_rgba(31,26,20,0.06)]",
          // Desktop enter/exit: scale + fade
          "data-starting-style:opacity-0 data-starting-style:scale-95",
          "data-ending-style:opacity-0 data-ending-style:scale-95",
          "transition-[opacity,transform] duration-200 motion-reduce:transition-none",
          // ── Mobile: bottom sheet ──────────────────────────────────────
          "max-mobile:left-0 max-mobile:right-0 max-mobile:bottom-0",
          "max-mobile:top-auto max-mobile:translate-x-0 max-mobile:translate-y-0",
          "max-mobile:w-full max-mobile:max-h-[92vh]",
          "max-mobile:rounded-t-[22px] max-mobile:rounded-b-none",
          // Mobile enter/exit: slide up + fade
          "max-mobile:data-starting-style:translate-y-full max-mobile:data-starting-style:opacity-80",
          "max-mobile:data-ending-style:translate-y-full max-mobile:data-ending-style:opacity-80",
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
function ModalHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="modal-header"
      className={cn(
        "flex items-start gap-4 px-6.5 pt-6 pb-1.5",
        "max-mobile:px-5 max-mobile:pt-5.5",
        className,
      )}
      {...props}
    />
  );
}

// ── Title ─────────────────────────────────────────────────────────────────────
function ModalTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogTitle
      data-slot="modal-title"
      className={cn("text-title font-bold text-ink m-0", className)}
      {...props}
    />
  );
}

// ── Description ───────────────────────────────────────────────────────────────
function ModalDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogDescription
      data-slot="modal-description"
      className={cn("text-caption text-ink-2 mt-1.5", className)}
      {...props}
    />
  );
}

// ── Close button ──────────────────────────────────────────────────────────────
function ModalClose({
  className,
  children,
  ...props
}: DialogPrimitive.Close.Props) {
  return (
    <DialogClose
      data-slot="modal-close"
      className={cn(
        "flex-none w-9 h-9 rounded-full bg-surface-2 border border-line text-ink-2",
        "flex items-center justify-center transition-colors",
        "hover:bg-line hover:text-ink",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
        className,
      )}
      {...props}
    >
      {children ?? <XIcon size={18} aria-hidden />}
    </DialogClose>
  );
}

// ── Body (scrollable) ─────────────────────────────────────────────────────────
function ModalBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="modal-body"
      className={cn(
        "flex-1 overflow-y-auto px-6.5 pt-4.5 pb-1.5",
        "max-mobile:px-5 max-mobile:pt-4",
        className,
      )}
      {...props}
    />
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function ModalFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="modal-footer"
      className={cn(
        "flex items-stretch gap-2 px-5 pt-3.5 border-t border-line bg-card mt-3.5",
        "pb-[calc(18px+env(safe-area-inset-bottom,0))]",
        "max-mobile:px-3.5 max-mobile:pb-[calc(16px+env(safe-area-inset-bottom,0))]",
        className,
      )}
      {...props}
    />
  );
}

export {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalClose,
  ModalBody,
  ModalFooter,
};
