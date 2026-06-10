import type React from "react";

// Step 1 illustration — "Pick a customer" — paths copied verbatim from Bahi Home.html (~line 1062)
// Colors are embedded (not theme-driven): #F46A39, #FBF6EF, #FFE7DA, #ECE3D4, #1F1A14, #9A8E80, #5A1E08
export function StepIllustration1(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="180" height="100" viewBox="0 0 180 100" fill="none" {...props}>
      <rect
        x="10"
        y="14"
        width="160"
        height="22"
        rx="10"
        fill="#fff"
        stroke="#ECE3D4"
        strokeWidth="1.5"
      />
      <circle cx="24" cy="25" r="7" fill="#F46A39" />
      <rect x="38" y="20" width="60" height="4" rx="2" fill="#1F1A14" />
      <rect x="38" y="28" width="42" height="3" rx="1.5" fill="#9A8E80" />
      <circle cx="155" cy="25" r="6" fill="#F46A39" />
      <path
        d="M152 25l2.5 2.5L158 22.5"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="10"
        y="46"
        width="160"
        height="22"
        rx="10"
        fill="#FBF6EF"
        stroke="#ECE3D4"
        strokeWidth="1.5"
      />
      <circle cx="24" cy="57" r="7" fill="#FFE7DA" />
      <rect x="38" y="52" width="50" height="4" rx="2" fill="#1F1A14" />
      <rect x="38" y="60" width="36" height="3" rx="1.5" fill="#9A8E80" />
      <rect
        x="10"
        y="78"
        width="160"
        height="14"
        rx="7"
        fill="#FFE7DA"
        stroke="#F46A39"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      <text
        x="90"
        y="88"
        textAnchor="middle"
        fontFamily="'Plus Jakarta Sans'"
        fontSize="9"
        fill="#5A1E08"
        fontWeight="800"
      >
        + Add new customer
      </text>
    </svg>
  );
}
