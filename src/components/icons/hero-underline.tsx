import type React from "react"

// Hero accent underline — path copied verbatim from Bahi Home.html (~line 836)
// Uses currentColor so the stroke follows parent text color (set to coral in context).
export function HeroUnderline(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 220 14"
      fill="none"
      preserveAspectRatio="none"
      {...props}
    >
      <path
        d="M2 9c40-8 84-8 124 0 30 6 60 6 92-2"
        stroke="currentColor"
        strokeWidth={4}
        strokeLinecap="round"
      />
    </svg>
  )
}
