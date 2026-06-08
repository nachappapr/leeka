import type React from "react"

export function CameraIcon({
  size = 20,
  className,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M4 8h3l2-2.5h6L17 8h3a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a1 1 0 0 1 1-1z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </svg>
  )
}
