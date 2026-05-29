import { Avatar, AvatarFallback } from "@/components/ui/primitives/avatar";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/primitives/card";
import { Separator } from "@/components/ui/primitives/separator";
import { FieldLabel } from "@/components/ui/custom/field-label";
import { InputField } from "@/components/ui/custom/input-field";
import { PillButton } from "@/components/ui/custom/pill-button";
import {
  StatusPill,
  type StatusPillStatus,
} from "@/components/ui/custom/status-pill";

const STATUSES: StatusPillStatus[] = [
  "draft",
  "sent",
  "viewed",
  "partial",
  "pending",
  "overdue",
  "paid",
];

const SWATCHES: { label: string; token: string; hex: string; cls: string }[] = [
  { label: "Coral", token: "--color-coral", hex: "#F46A39", cls: "bg-coral" },
  {
    label: "Coral · press",
    token: "--color-coral-press",
    hex: "#D9531F",
    cls: "bg-coral-press",
  },
  {
    label: "Coral · soft",
    token: "--color-coral-soft",
    hex: "#FFE7DA",
    cls: "bg-coral-soft",
  },
  { label: "Cream", token: "--color-cream", hex: "#FBF6EF", cls: "bg-cream" },
  {
    label: "Surface 2",
    token: "--color-surface-2",
    hex: "#F5EFE6",
    cls: "bg-surface-2",
  },
  { label: "Ink", token: "--color-ink", hex: "#1F1A14", cls: "bg-ink" },
  {
    label: "Line · strong",
    token: "--color-line-strong",
    hex: "#D9CDB8",
    cls: "bg-line-strong",
  },
  { label: "Paid", token: "--color-paid", hex: "#1F9D55", cls: "bg-paid" },
  {
    label: "Pending",
    token: "--color-pending",
    hex: "#C98000",
    cls: "bg-pending",
  },
  {
    label: "Overdue",
    token: "--color-overdue",
    hex: "#C5392B",
    cls: "bg-overdue",
  },
  { label: "Info", token: "--color-info", hex: "#1B6FA8", cls: "bg-info" },
  {
    label: "WhatsApp",
    token: "--color-whatsapp",
    hex: "#008069",
    cls: "bg-whatsapp",
  },
];

function Section({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-14">
      <h2 className="mb-1 text-2xl font-extrabold tracking-tight text-ink">
        {title}
      </h2>
      {intro ? (
        <p className="mb-6 max-w-2xl text-body text-ink-2">{intro}</p>
      ) : (
        <div className="mb-6" />
      )}
      {children}
    </section>
  );
}

function ColorSwatches() {
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4">
      {SWATCHES.map((s) => (
        <div
          key={s.token}
          className="overflow-hidden rounded-lg bg-card shadow-card"
        >
          <div className={`h-20 ${s.cls}`} aria-hidden />
          <div className="px-3.5 py-3">
            <div className="text-body-sm font-extrabold text-ink">{s.label}</div>
            <div className="mt-0.5 font-mono text-label text-ink-3">
              {s.token}
            </div>
            <div className="mt-0.5 font-mono text-label text-ink-2">{s.hex}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ButtonShowcase() {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-2.5 text-body font-extrabold text-ink">Tones</h3>
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-card p-7 shadow-card">
          <PillButton tone="primary">Primary action</PillButton>
          <PillButton tone="secondary">Secondary</PillButton>
          <PillButton tone="outline">Outline</PillButton>
          <PillButton tone="ghost">Ghost</PillButton>
          <PillButton tone="paid">Mark paid</PillButton>
          <PillButton tone="whatsapp">Send on WhatsApp</PillButton>
          <PillButton tone="destructive">Delete</PillButton>
        </div>
      </div>
      <div>
        <h3 className="mb-2.5 text-body font-extrabold text-ink">onCoral tone</h3>
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-primary p-7">
          <PillButton tone="onCoral">Get started free</PillButton>
        </div>
      </div>
      <div>
        <h3 className="mb-2.5 text-body font-extrabold text-ink">Sizes</h3>
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-card p-7 shadow-card">
          <PillButton size="sm">Small · 36</PillButton>
          <PillButton size="md">Default · 44</PillButton>
          <PillButton size="lg">Large · 52</PillButton>
        </div>
      </div>
      <div>
        <h3 className="mb-2.5 text-body font-extrabold text-ink">States</h3>
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-card p-7 shadow-card">
          <PillButton>Default</PillButton>
          <PillButton className="bg-coral-press">Pressed</PillButton>
          <PillButton disabled>Disabled</PillButton>
        </div>
      </div>
    </div>
  );
}

function StatusPillShowcase() {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-card p-7 shadow-card">
      {STATUSES.map((s) => (
        <StatusPill key={s} status={s} />
      ))}
    </div>
  );
}

function InputShowcase() {
  return (
    <div className="grid max-w-xl gap-4 rounded-xl bg-card p-7 shadow-card">
      <div>
        <FieldLabel htmlFor="biz">Business name</FieldLabel>
        <InputField id="biz" defaultValue="Raj Kumar Trading" />
      </div>
      <div>
        <FieldLabel htmlFor="phone">Phone</FieldLabel>
        <InputField id="phone" defaultValue="+91 98765 43210" />
      </div>
      <div>
        <FieldLabel htmlFor="gstin">GSTIN · optional</FieldLabel>
        <InputField
          id="gstin"
          size="mobile"
          placeholder="22AAAAA0000A1Z5"
        />
      </div>
    </div>
  );
}

function CardShowcase() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="text-label font-extrabold tracking-wide text-ink-3 uppercase">
            Received this month
          </div>
          <CardTitle className="tabular mt-2 font-sans text-3xl font-extrabold tracking-tight text-paid-ink">
            ₹68,200
          </CardTitle>
          <CardDescription className="mt-1.5 text-body-sm text-ink-2">
            ↗ 12% vs last month
          </CardDescription>
        </CardHeader>
      </Card>
      <Card className="bg-primary text-primary-foreground">
        <CardHeader>
          <div className="text-label font-extrabold tracking-wide opacity-90 uppercase">
            Total outstanding
          </div>
          <CardTitle className="tabular mt-2 font-sans text-4xl font-extrabold tracking-tight">
            ₹26,400
          </CardTitle>
          <CardDescription className="mt-1.5 text-body-sm text-primary-foreground/90">
            4 unpaid invoices
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function AvatarShowcase() {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl bg-card p-7 shadow-card">
      <Avatar size="sm">
        <AvatarFallback>RK</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AS</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>PM</AvatarFallback>
      </Avatar>
      <Avatar size="lg" className="bg-primary">
        <AvatarFallback className="bg-primary text-primary-foreground">
          B
        </AvatarFallback>
      </Avatar>
    </div>
  );
}

function TypographyShowcase() {
  return (
    <div className="rounded-xl bg-card p-7 shadow-card">
      <div className="grid items-baseline gap-6 border-b border-line py-5 md:grid-cols-[200px_1fr]">
        <div className="text-label text-ink-3">
          <div className="mb-1 text-body-sm font-extrabold text-ink">
            Display · money
          </div>
          <div>Plus Jakarta · 800</div>
          <div className="font-mono">48 / 1 · tnum lnum</div>
        </div>
        <div className="tabular text-h1 font-extrabold tracking-tight text-primary">
          ₹68,200
        </div>
      </div>
      <div className="grid items-baseline gap-6 border-b border-line py-5 md:grid-cols-[200px_1fr]">
        <div className="text-label text-ink-3">
          <div className="mb-1 text-body-sm font-extrabold text-ink">
            Heading · h1
          </div>
          <div>Plus Jakarta · 800</div>
          <div className="font-mono">28 / 1.1</div>
        </div>
        <div className="text-3xl font-extrabold tracking-tight text-ink">
          Let&apos;s send your first invoice
        </div>
      </div>
      <div className="grid items-baseline gap-6 border-b border-line py-5 md:grid-cols-[200px_1fr]">
        <div className="text-label text-ink-3">
          <div className="mb-1 text-body-sm font-extrabold text-ink">Body</div>
          <div>Plus Jakarta · 500</div>
          <div className="font-mono">16 / 1.5</div>
        </div>
        <div className="text-body font-medium text-ink-2">
          Pick a customer or add a new one — your saved customers show up first.
        </div>
      </div>
      <div className="grid items-baseline gap-6 py-5 md:grid-cols-[200px_1fr]">
        <div className="text-label text-ink-3">
          <div className="mb-1 text-body-sm font-extrabold text-ink">Devanagari</div>
          <div>Noto Sans Devanagari · 700</div>
        </div>
        <div className="text-2xl font-bold text-ink">
          नमस्ते, राज · कुल बकाया ₹26,400
        </div>
      </div>
    </div>
  );
}

export function DesignSystemContainer() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:py-16">
      <header className="mb-12">
        <div className="inline-block rounded-full bg-coral-soft px-3 py-1 text-label font-extrabold tracking-widest text-coral-ink uppercase">
          Design system · v0.1
        </div>
        <h1 className="mt-4 max-w-3xl text-h1 font-extrabold tracking-tight text-ink">
          Lekka — a warm, chat-app-simple invoicing tool.
        </h1>
        <p className="mt-4 max-w-2xl text-title-sm text-ink-2">
          Warm coral on cream. Soft, friendly, the opposite of cold corporate
          fintech. This page exercises every token and reusable primitive
          currently in the design system.
        </p>
      </header>

      <Section
        id="colors"
        title="Colour"
        intro="One vivid coral primary, warm neutrals, semantic colours for invoice status, and dedicated brand tones for WhatsApp."
      >
        <ColorSwatches />
      </Section>

      <Separator className="my-12" />

      <Section
        id="type"
        title="Typography"
        intro="Plus Jakarta Sans paired with Noto Sans Devanagari for full Hindi support. 16 px body minimum — the audience skews older."
      >
        <TypographyShowcase />
      </Section>

      <Separator className="my-12" />

      <Section
        id="buttons"
        title="Buttons"
        intro="Pill-shaped, friendly. One primary per screen — never two. WhatsApp gets its own brand colour for the send action."
      >
        <ButtonShowcase />
      </Section>

      <Section
        id="pills"
        title="Status pills"
        intro="The full invoice lifecycle has a colour: draft → sent → viewed → partial → paid, plus overdue."
      >
        <StatusPillShowcase />
      </Section>

      <Section
        id="inputs"
        title="Inputs"
        intro="Generous height, big text, clear focus state. Labels are uppercase. Web 44 px, mobile 56 px."
      >
        <InputShowcase />
      </Section>

      <Section
        id="cards"
        title="Cards"
        intro="White surface, 18 px radius, warm shadow. Everything that contains information lives in a card."
      >
        <CardShowcase />
      </Section>

      <Section
        id="avatars"
        title="Avatars"
        intro="Circular initials avatar. Coral tint is the default for the customer-list density. Three sizes."
      >
        <AvatarShowcase />
      </Section>
    </main>
  );
}
