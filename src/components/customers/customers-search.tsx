"use client";

import { useId } from "react";

import { Search } from "@/components/icons";
import { InputField } from "@/components/ui/custom/input-field";

interface CustomersSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function CustomersSearch({ value, onChange }: CustomersSearchProps) {
  const hintId = useId();

  return (
    <div className="relative max-w-xs flex-1">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3"
        aria-hidden
      />
      <span id={hintId} className="sr-only">
        Searches all customers
      </span>
      <InputField
        placeholder="Search customers…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9"
        aria-label="Search customers"
        aria-describedby={hintId}
      />
    </div>
  );
}
