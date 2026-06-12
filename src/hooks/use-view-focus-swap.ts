import { useEffect, useRef } from "react";

// Focus management (WCAG 2.4.3): swap focus to the review heading on
// edit→preview, restore to the preview CTA on preview→edit.
// hasMountedRef prevents focus theft on the initial render.
export function useViewFocusSwap(view: "edit" | "preview") {
  const reviewHeadingRef = useRef<HTMLHeadingElement>(null);
  const previewBtnRef = useRef<HTMLButtonElement>(null);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    if (view === "preview") reviewHeadingRef.current?.focus();
    else previewBtnRef.current?.focus();
  }, [view]);

  return { reviewHeadingRef, previewBtnRef };
}
