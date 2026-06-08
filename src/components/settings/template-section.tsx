"use client"

import { useState } from "react"

import { Card } from "@/components/ui/custom/card"
import { FieldLabel } from "@/components/ui/custom/field-label"
import { InputField } from "@/components/ui/custom/input-field"
import { AccentSwatch } from "@/components/settings/accent-swatch"
import { SETTINGS_ACCENTS } from "@/lib/constants/settings"

export function TemplateSection() {
  const [accent, setAccent] = useState(SETTINGS_ACCENTS[0])

  return (
    <Card title="Invoice template" headingLevel={3}>
      <div className="flex flex-col gap-5 p-6">
        <div>
          <FieldLabel id="accent-label">Accent colour</FieldLabel>
          <div className="mt-1.5 flex flex-wrap gap-2.5" role="radiogroup" aria-labelledby="accent-label">
            {SETTINGS_ACCENTS.map((color) => (
              <AccentSwatch
                key={color}
                color={color}
                selected={accent === color}
                onSelect={() => setAccent(color)}
              />
            ))}
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="tpl-footer">Footer message</FieldLabel>
          <InputField
            id="tpl-footer"
            defaultValue="Thank you for your business!"
            size="web"
          />
        </div>
      </div>
    </Card>
  )
}
