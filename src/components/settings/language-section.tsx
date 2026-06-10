"use client";

import { useState } from "react";

import { Card } from "@/components/ui/custom/card";
import { LanguageTile } from "@/components/settings/language-tile";
import { SETTINGS_LANGUAGES } from "@/lib/constants/settings";

export function LanguageSection() {
  const [selected, setSelected] = useState("hi");

  return (
    <Card headingLevel={3}>
      <div className="p-6">
        <h3 id="language-label" className="mb-0 text-title-sm font-extrabold text-ink">
          Language
        </h3>
        <p className="mb-4 mt-1 text-body-sm text-ink-2">
          Choose the language for the app and invoices.
        </p>
        <div
          className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2.5"
          role="radiogroup"
          aria-labelledby="language-label"
        >
          {SETTINGS_LANGUAGES.map((lang) => (
            <LanguageTile
              key={lang.id}
              language={lang}
              selected={selected === lang.id}
              onSelect={() => setSelected(lang.id)}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
