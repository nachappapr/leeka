import type React from "react"

// Step 3 illustration — "Send on WhatsApp" — paths copied verbatim from Bahi Home.html (~line 1107)
// Colors are embedded (not theme-driven): #25D366, #1F1A14
export function StepIllustration3(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="180"
      height="100"
      viewBox="0 0 180 100"
      fill="none"
      {...props}
    >
      <rect x="40" y="14" width="100" height="60" rx="14" fill="#25D366" />
      <path d="M68 44a22 22 0 1 1 36 0 22 22 0 0 1-36 0z" fill="rgba(255,255,255,0.2)" />
      <path d="M82 42c0 6 5 11 11 11l2.5-2.5c.5-.5 1.5-.8 2-.4l3.5 1.8c.8.4 1 1.4.4 2A7.4 7.4 0 0 1 93 56C85.8 56 79 49.2 79 42c0-2.2.8-4 3-5.2.6-.4 1.6 0 2 .6l1.8 3.2c.4.8.2 1.6-.4 2.2L83 44" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <text x="90" y="84" textAnchor="middle" fontFamily="'Plus Jakarta Sans'" fontSize="11" fill="#1F1A14" fontWeight="800">Sent on WhatsApp ✓</text>
    </svg>
  )
}
