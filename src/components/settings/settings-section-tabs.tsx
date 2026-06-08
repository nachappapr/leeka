"use client"

import { cn } from "@/lib/utils"
import { SETTINGS_SECTIONS } from "@/lib/constants/settings"
import type { SettingsSectionId } from "@/lib/types/settings"

interface SettingsSectionTabsProps {
  activeSection: SettingsSectionId
  onSectionChange: (id: SettingsSectionId) => void
}

export function SettingsSectionTabs({
  activeSection,
  onSectionChange,
}: SettingsSectionTabsProps) {
  return (
    <nav
      aria-label="Settings sections, mobile navigation"
      className="-mx-4 overflow-x-auto scrollbar-none px-4 pb-2.5 pt-1 min-mobile:hidden [&::-webkit-scrollbar]:hidden"
    >
      <ul className="m-0 flex list-none gap-2 p-0">
        {SETTINGS_SECTIONS.map((s) => {
          const Icon = s.icon
          const isActive = s.id === activeSection
          return (
            <li key={s.id}>
              <button
                type="button"
                aria-current={isActive ? "true" : undefined}
                onClick={() => onSectionChange(s.id)}
                className={cn(
                  "inline-flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border-[1.5px] px-3.5 py-3 text-caption font-semibold transition-[background,border-color,color] duration-100 motion-reduce:transition-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
                  isActive
                    ? "border-ink bg-ink text-card"
                    : "border-line bg-card text-ink-2 hover:border-line-strong hover:text-ink",
                )}
              >
                <Icon size={15} aria-hidden />
                {s.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
