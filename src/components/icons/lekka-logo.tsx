import type React from "react";

// ArthaPatra brand mark — receipt stub with serrated bottom edge.
// White body; dark lines render on coral or dark tile backgrounds.
// Sub-line opacity 0.4 per design (wordmark-color.jsx BrandLogo reference).
export function LekkaLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 100 100" fill="none" aria-hidden="true" {...props}>
      <path
        d="M 18 14 L 82 14 L 82 76 L 78 82 L 70 76 L 62 82 L 54 76 L 46 82 L 38 76 L 30 82 L 22 76 L 18 82 Z"
        fill="#FFFFFF"
      />
      <rect x="28" y="32" width="44" height="6" rx="2" fill="#15110C" />
      <rect x="28" y="46" width="36" height="4" rx="2" fill="#15110C" opacity=".4" />
      <rect x="28" y="56" width="28" height="4" rx="2" fill="#15110C" opacity=".4" />
    </svg>
  );
}
