import type React from "react"

// Lekka brand logo glyph — receipt shape with serrated bottom edge.
// Paths copied verbatim from ArthaPatra Home.html nav (~line 971).
// Fills are hardcoded: the mark is always rendered inside a coral square.
export function LekkaLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M 18 14 L 82 14 L 82 76 L 78 82 L 70 76 L 62 82 L 54 76 L 46 82 L 38 76 L 30 82 L 22 76 L 18 82 Z"
        fill="#FFFFFF"
      />
      <rect x="28" y="32" width="44" height="6" rx="2" fill="#15110C" />
      <rect x="28" y="46" width="36" height="4" rx="2" fill="#15110C" opacity=".22" />
      <rect x="28" y="56" width="28" height="4" rx="2" fill="#15110C" opacity=".22" />
    </svg>
  )
}
