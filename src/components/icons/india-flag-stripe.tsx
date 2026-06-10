import type React from "react";

// India flag stripe — rendered as a small SVG component.
// Design pattern from Bahi Home.html (~lines 977, 1471):
// linear-gradient(180deg, #FF9933 0 33%, #fff 33% 66%, #138808 66%) with border-radius 2px
// Rendered as three stacked rects to match the flag tricolour exactly.
export function IndiaFlagStripe(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="18"
      height="12"
      viewBox="0 0 18 12"
      fill="none"
      role="img"
      aria-label="India flag"
      {...props}
    >
      <rect x="0" y="0" width="18" height="4" fill="#FF9933" rx="2" />
      <rect x="0" y="4" width="18" height="4" fill="#ffffff" />
      <rect x="0" y="8" width="18" height="4" fill="#138808" rx="2" />
    </svg>
  );
}
