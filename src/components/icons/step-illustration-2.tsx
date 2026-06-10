import type React from "react";

// Step 2 illustration — "Add what you sold" — paths copied verbatim from Bahi Home.html (~line 1084)
// Colors are embedded (not theme-driven): #F46A39, #FBF6EF, #ECE3D4, #1F1A14
export function StepIllustration2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="180" height="100" viewBox="0 0 180 100" fill="none" {...props}>
      <rect
        x="10"
        y="14"
        width="160"
        height="20"
        rx="6"
        fill="#fff"
        stroke="#ECE3D4"
        strokeWidth="1.5"
      />
      <rect x="18" y="22" width="80" height="4" rx="2" fill="#1F1A14" />
      <rect x="120" y="20" width="14" height="8" rx="2" fill="#FBF6EF" />
      <rect x="140" y="20" width="14" height="8" rx="2" fill="#FBF6EF" />
      <rect x="156" y="20" width="10" height="8" rx="2" fill="#F46A39" />
      <rect
        x="10"
        y="38"
        width="160"
        height="20"
        rx="6"
        fill="#fff"
        stroke="#ECE3D4"
        strokeWidth="1.5"
      />
      <rect x="18" y="46" width="60" height="4" rx="2" fill="#1F1A14" />
      <rect x="120" y="44" width="14" height="8" rx="2" fill="#FBF6EF" />
      <rect x="140" y="44" width="14" height="8" rx="2" fill="#FBF6EF" />
      <rect x="156" y="44" width="10" height="8" rx="2" fill="#F46A39" />
      <rect x="10" y="68" width="160" height="22" rx="6" fill="#F46A39" />
      <rect x="18" y="78" width="38" height="5" rx="2" fill="rgba(255,255,255,0.8)" />
      <text
        x="160"
        y="84"
        textAnchor="end"
        fontFamily="'Plus Jakarta Sans'"
        fontSize="13"
        fill="#fff"
        fontWeight="800"
      >
        ₹4,725
      </text>
    </svg>
  );
}
