import type React from "react"

interface TornDocProps extends React.SVGProps<SVGSVGElement> {
  strokeColor?: string
  accentColor?: string
  softColor?: string
}

export function TornDoc({
  strokeColor = "var(--color-line-strong)",
  accentColor = "var(--color-coral)",
  softColor = "var(--color-overdue-soft)",
  ...props
}: TornDocProps) {
  return (
    <svg
      viewBox="0 0 132 150"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M14 8 h104 a6 6 0 0 1 6 6 v52 l-9 4 l-9 -4 l-9 4 l-9 -4 l-9 4 l-9 -4 l-9 4 l-9 -4 l-9 4 l-9 -4 l-9 4 l-2 -1 v-58 a6 6 0 0 1 6 -6 z"
        fill="#fff"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <rect x="28" y="24" width="48" height="7" rx="3" fill={accentColor} opacity="0.9" />
      <rect x="28" y="40" width="76" height="5" rx="2.5" fill={strokeColor} />
      <rect x="28" y="51" width="60" height="5" rx="2.5" fill={strokeColor} />
      <g transform="rotate(7 66 118)">
        <path
          d="M16 96 l9 4 l9 -4 l9 4 l9 -4 l9 4 l9 -4 l9 4 l9 -4 l9 4 l9 -4 l9 4 l2 -1 v40 a6 6 0 0 1 -6 6 h-92 a6 6 0 0 1 -6 -6 v-40 z"
          fill="#fff"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <rect x="28" y="116" width="50" height="5" rx="2.5" fill={strokeColor} />
        <rect x="28" y="127" width="34" height="5" rx="2.5" fill={strokeColor} />
        <rect x="84" y="116" width="20" height="16" rx="4" fill={softColor} />
      </g>
    </svg>
  )
}
