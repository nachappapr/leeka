"use client"

import { useRouter } from "next/navigation"

import { LogOut } from "@/components/icons"
import { Card } from "@/components/ui/custom/card"
import { cn } from "@/lib/utils"
import { SETTINGS_SECTIONS } from "@/lib/constants/settings"
import type { SettingsSectionId } from "@/lib/types/settings"

interface SettingsSectionAsideProps {
  activeSection: SettingsSectionId
  onSectionChange: (id: SettingsSectionId) => void
}

export function SettingsSectionAside({
  activeSection,
  onSectionChange,
}: SettingsSectionAsideProps) {
  const router = useRouter()

  return (
    <Card className="max-mobile:hidden">
      <nav aria-label="Settings sections" className="p-2">
        <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
          {SETTINGS_SECTIONS.map((s) => {
            const Icon = s.icon
            const isActive = s.id === activeSection
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onSectionChange(s.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 rounded-nav-item border-0 px-3 py-2.5 text-left text-body-sm font-semibold transition-[background,color] duration-100 motion-reduce:transition-none",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
                    isActive
                      ? "bg-coral-soft text-coral-ink [&_svg]:text-coral-press"
                      : "bg-transparent text-ink-2 hover:bg-background hover:text-ink",
                  )}
                >
                  <Icon size={20} aria-hidden />
                  <span>{s.label}</span>
                </button>
              </li>
            )
          })}

          <li className="mt-2 border-t border-line pt-2">
            <button
              type="button"
              onClick={() => router.push("/auth")}
              className={cn(
                "flex w-full cursor-pointer items-center gap-3 rounded-nav-item border-0 px-3 py-2.5 text-left text-body-sm font-semibold transition-[background,color] duration-100 motion-reduce:transition-none",
                "text-overdue hover:bg-overdue-soft hover:text-overdue-ink",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
              )}
            >
              <LogOut size={20} aria-hidden />
              <span>Log out</span>
            </button>
          </li>
        </ul>
      </nav>
    </Card>
  )
}
