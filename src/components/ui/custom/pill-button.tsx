import * as React from "react";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const pillButtonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full border-[1.5px] border-transparent font-sans font-bold whitespace-nowrap transition-[background-color,box-shadow,transform,color,border-color] outline-none select-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      tone: {
        primary:
          "bg-primary text-primary-foreground shadow-press hover:bg-coral-press",
        secondary: "bg-coral-soft text-coral-ink hover:bg-coral-soft/80",
        outline: "bg-card text-foreground border-ink-3 hover:bg-surface-2",
        ghost: "bg-transparent text-foreground hover:bg-surface-2",
        paid: "bg-paid text-card shadow-press hover:bg-paid-ink",
        whatsapp: "bg-whatsapp text-card shadow-press hover:bg-whatsapp-press",
        destructive:
          "bg-destructive text-card shadow-press hover:bg-overdue-ink",
        onCoral: "bg-card text-coral-ink hover:bg-coral-soft",
        draft: "bg-draft-soft text-draft-ink hover:bg-draft-soft/80 active:bg-draft-soft/60",
      },
      size: {
        sm: "h-9 px-3.5 text-caption",
        md: "h-11 px-4.5 text-body-sm",
        lg: "h-13 px-6 text-body",
      },
    },
    defaultVariants: {
      tone: "primary",
      size: "md",
    },
  },
);

const PillButton = React.forwardRef<
  HTMLButtonElement,
  ButtonPrimitive.Props & VariantProps<typeof pillButtonVariants>
>(function PillButton(
  {
    className,
    tone = "primary",
    size = "md",
    render,
    nativeButton,
    ...props
  },
  ref,
) {
  return (
    <ButtonPrimitive
      ref={ref}
      data-slot="pill-button"
      data-tone={tone}
      className={cn(pillButtonVariants({ tone, size }), className)}
      render={render}
      nativeButton={nativeButton ?? render === undefined}
      {...props}
    />
  );
});

PillButton.displayName = "PillButton";

export { PillButton, pillButtonVariants };
