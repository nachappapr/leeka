import type React from "react"

// Custom WhatsApp icon — paths copied verbatim from design source
export function WhatsApp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20.5 11.5a8.5 8.5 0 1 1-3.4-6.8L20.5 4l-.9 3.6a8.45 8.45 0 0 1 .9 3.9z" />
      <path d="M9 8.5c0 3 2.5 5.5 5.5 5.5l1.2-1.2c.3-.3.7-.4 1-.2l1.7.9c.4.2.5.7.2 1A3.7 3.7 0 0 1 15 16C11.4 16 8 12.6 8 9c0-1.1.4-2 1.5-2.6.3-.2.8 0 1 .3l.9 1.6c.2.4.1.8-.2 1.1L10 10.5" />
    </svg>
  )
}
