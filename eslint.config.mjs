// Lint rules borrowed from ../reppit/apps/web + ../reppit-web, adapted to lekka's
// src-prefixed paths and extended with the icon-foldering rule.
//
// Requires:  pnpm add -D eslint-plugin-better-tailwindcss eslint-plugin-jsx-a11y
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import betterTailwind from "eslint-plugin-better-tailwindcss";
import jsxA11y from "eslint-plugin-jsx-a11y";
import sonarjs from "eslint-plugin-sonarjs";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // jsx-a11y recommended. The plugin itself is already registered by
  // eslint-config-next; we just pull in the rule set.
  { rules: jsxA11y.flatConfigs.recommended.rules },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".claude/**",
    ".design-ref/**",
    ".sandcastle/**",
  ]),

  // ── Tailwind correctness + design-token enforcement ──────────────────────
  // Feature code (src/app, src/components) must use design tokens, not
  // arbitrary values. Wrappers in src/components/ui are exempt — they own
  // the styling work and may use whatever the design system needs.
  {
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    ignores: ["src/components/ui/**"],
    plugins: { "better-tailwindcss": betterTailwind },
    settings: {
      "better-tailwindcss": { entryPoint: "src/app/globals.css" },
    },
    rules: {
      "better-tailwindcss/no-conflicting-classes": "error",
      "better-tailwindcss/no-duplicate-classes": "error",
      "better-tailwindcss/no-deprecated-classes": "error",
      "better-tailwindcss/no-unnecessary-whitespace": "warn",
      "better-tailwindcss/no-restricted-classes": [
        "error",
        {
          restrict: [
            {
              pattern: "-\\[#[0-9A-Fa-f]{3,8}\\]$",
              message:
                "Arbitrary hex color is banned. Use a named token (bg-primary, text-ink, etc.) defined in src/app/globals.css.",
            },
            {
              pattern:
                "^(?:-?(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|w|h|min-w|min-h|max-w|max-h|top|right|bottom|left|inset|size|space-x|space-y))-\\[\\d+(?:\\.\\d+)?(?:px|rem|em)\\]$",
              message:
                "Arbitrary spacing is banned. Use canonical Tailwind spacing (p-4, gap-2.5) or a named token from src/app/globals.css.",
            },
            {
              pattern:
                "^(?:text|leading|tracking)-\\[(?:-?\\d+(?:\\.\\d+)?(?:px|rem|em)?|-?\\.\\d+)\\]$",
              message:
                "Arbitrary typography values are banned. Use a Tailwind size class (text-base, text-lg) or a named token from src/app/globals.css.",
            },
            {
              pattern: "^rounded(?:-[a-z]+)?-\\[\\d+(?:\\.\\d+)?(?:px|rem|em)\\]$",
              message:
                "Arbitrary border-radius is banned. Use a named radius (rounded-md, rounded-pill) or a token from src/app/globals.css.",
            },
          ],
        },
      ],
    },
  },

  // ── No inline `style` props on JSX in feature code ───────────────────────
  // Styling goes through Tailwind classes on the wrappers. For data-driven
  // values (e.g. `style={{ ['--accent']: tone }}`), add an inline disable
  // comment with a one-line justification.
  {
    files: ["src/app/**/*.tsx", "src/components/**/*.tsx"],
    ignores: ["src/components/ui/**"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector: "JSXAttribute[name.name='style']",
          message:
            "Inline style props are banned. Use Tailwind classes via a src/components/ui wrapper. For data-driven values, add `// eslint-disable-next-line no-restricted-syntax` with a justification.",
        },
      ],
    },
  },

  // ── Component complexity gates ───────────────────────────────────────────
  // Catch mega-components and deeply-nested JSX so they get split. shadcn
  // primitives in src/components/ui own the styling work and are exempt.
  // These are smell detectors, not hard truths — extract when the rule trips
  // AND a sensible split exists; don't create one-call wrappers just to pass.
  {
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    ignores: ["src/components/ui/**"],
    plugins: { sonarjs },
    rules: {
      "max-lines-per-function": [
        "error",
        { max: 200, skipBlankLines: true, skipComments: true, IIFEs: true },
      ],
      "react/jsx-max-depth": ["error", { max: 6 }],
      "sonarjs/cognitive-complexity": ["error", 15],
    },
  },

  // ── Icons live in src/components/icons ───────────────────────────────────
  // Lucide is the icon library (see components.json). All icons must be
  // imported from @/components/icons, which re-exports from lucide-react and
  // owns any custom SVGs. Direct imports of lucide-react elsewhere are
  // blocked.
  {
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    ignores: ["src/components/icons/**", "src/components/ui/primitives/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "lucide-react",
              message:
                "Import icons from @/components/icons. Add a re-export there if the icon you need is missing.",
            },
          ],
        },
      ],
    },
  },

  // Shadcn-generated hooks may use patterns that trigger React rules —
  // don't lint them as feature code.
  {
    files: ["src/hooks/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
