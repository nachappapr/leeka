"use client";

import { useState } from "react";

import { Card } from "@/components/ui/custom/card";
import { FieldLabel } from "@/components/ui/custom/field-label";
import { InputField } from "@/components/ui/custom/input-field";
import { ToggleSwitch } from "@/components/ui/custom/toggle-switch";
import { SETTINGS_TAX_TOGGLES } from "@/lib/constants/settings";

export function TaxSection() {
  const [toggles, setToggles] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(SETTINGS_TAX_TOGGLES.map((t) => [t.id, t.defaultOn])),
  );

  function setToggle(id: string, value: boolean) {
    setToggles((prev) => ({ ...prev, [id]: value }));
  }

  return (
    <Card title="Tax & GST defaults" headingLevel={3}>
      <div className="p-6">
        <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
          <div>
            <FieldLabel htmlFor="tax-rate">Default tax rate</FieldLabel>
            <InputField id="tax-rate" defaultValue="5" size="web" />
          </div>
          <div>
            <FieldLabel htmlFor="tax-type">Tax type</FieldLabel>
            <InputField id="tax-type" defaultValue="GST" size="web" />
          </div>
        </div>

        <div>
          {SETTINGS_TAX_TOGGLES.map((t) => (
            <ToggleSwitch
              key={t.id}
              id={`tax-toggle-${t.id}`}
              label={t.label}
              checked={toggles[t.id] ?? false}
              onCheckedChange={(v) => setToggle(t.id, v)}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
