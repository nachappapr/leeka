import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// The design system defines its own font-size scale in globals.css `@theme`
// (numeric `text-9`…`text-64` + semantic `text-body`, `text-label`, …).
// tailwind-merge doesn't know these are font sizes, so by default it lumps
// them into the `text-color` group — meaning `cn("text-11", "text-ink-3")`
// would discard `text-11` and the element falls back to the inherited size.
// Registering them in the `font-size` group keeps size + color coexisting.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "9",
            "10",
            "11",
            "12",
            "13",
            "14",
            "15",
            "16",
            "17",
            "18",
            "19",
            "20",
            "22",
            "24",
            "26",
            "28",
            "32",
            "36",
            "40",
            "44",
            "48",
            "56",
            "64",
            "kicker",
            "label",
            "caption",
            "body-sm",
            "body",
            "title-sm",
            "lead",
            "title",
            "h2",
            "h1",
            "money",
            "money-sm",
            "display",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
