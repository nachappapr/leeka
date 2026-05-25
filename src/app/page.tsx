import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const features = [
  {
    num: "01",
    title: "Smart Invoices",
    desc: "Auto-populate client details, tax rates, and line items. Send a polished invoice in under 60 seconds.",
  },
  {
    num: "02",
    title: "Instant Reminders",
    desc: "Set it and forget it. Automated follow-ups nudge clients without you lifting a finger.",
  },
  {
    num: "03",
    title: "Multi-currency",
    desc: "Bill in any currency. Real-time exchange rates, zero surprises. International clients, welcome.",
  },
  {
    num: "04",
    title: "Live Dashboard",
    desc: "Track outstanding, overdue, and paid in one clean view. Know your cash position at a glance.",
  },
  {
    num: "05",
    title: "One-click Pay",
    desc: "Stripe, PayPal, bank transfer — clients pay how they want. You get notified the moment funds land.",
  },
  {
    num: "06",
    title: "Tax Ready",
    desc: "Auto-calculate VAT, GST, and sales tax. Export clean reports when EOFY comes around.",
  },
];

const testimonials = [
  {
    quote: "I used to dread invoicing. Lekka made it the easiest part of my month.",
    name: "Amara K.",
    role: "Brand Designer",
    initials: "AK",
  },
  {
    quote: "Cut my time on admin by 80%. The automatic reminders alone paid for itself.",
    name: "Deon V.",
    role: "Freelance Dev",
    initials: "DV",
  },
  {
    quote: "Finally an invoicing tool that doesn't look like it's from 2009.",
    name: "Siya M.",
    role: "Creative Director",
    initials: "SM",
  },
];

const tickers = [
  "Send faster", "Get paid sooner", "Zero friction", "Built for freelancers",
  "Multi-currency", "Tax ready", "Send faster", "Get paid sooner",
  "Zero friction", "Built for freelancers", "Multi-currency", "Tax ready",
];

const stats = [
  { value: "12s", label: "avg. invoice creation time" },
  { value: "3×", label: "faster payment turnaround" },
  { value: "98%", label: "client satisfaction rate" },
  { value: "40+", label: "currencies supported" },
];

export default function Home() {
  return (
    <main className="flex-1 overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5 backdrop-blur-md bg-[#0e0e0e]/80">
        <span className="font-mono text-xl font-bold tracking-tight text-[#c8f135]">
          lekka
        </span>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/50 font-medium">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white text-sm hidden md:inline-flex">
            Sign in
          </Button>
          <Button
            size="sm"
            className="bg-[#c8f135] text-[#0e0e0e] hover:bg-[#d6f755] font-bold text-sm px-5 rounded-full"
          >
            Start free
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col justify-center pt-24 pb-16 px-6 md:px-12 overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(245,242,235,1) 1px, transparent 1px), linear-gradient(90deg, rgba(245,242,235,1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        {/* Large BG symbol */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[30vw] font-bold text-white/[0.02] select-none leading-none font-mono pr-8">
          ₊
        </div>

        <div className="relative max-w-7xl mx-auto w-full">
          <div className="animate-fade-up delay-100">
            <Badge className="bg-[#c8f135]/10 text-[#c8f135] border border-[#c8f135]/20 font-mono text-xs px-3 py-1 rounded-full mb-8 inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c8f135] animate-pulse-lime inline-block" />
              Now in public beta
            </Badge>
          </div>

          <h1 className="animate-fade-up delay-200 text-[13vw] md:text-[9vw] lg:text-[8vw] font-extrabold leading-[0.9] tracking-tight mb-6">
            <span className="block text-[#f5f2eb]">Invoicing</span>
            <span className="block text-[#c8f135] lime-glow">made light.</span>
          </h1>

          <div className="animate-fade-up delay-300 flex flex-col md:flex-row md:items-end gap-8 mt-10">
            <p className="text-white/50 text-lg md:text-xl max-w-md leading-relaxed">
              Create, send, and track invoices without the admin nightmare.
              Built for freelancers who&apos;d rather be doing the work.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:ml-auto md:pb-1 shrink-0">
              <Button
                size="lg"
                className="bg-[#c8f135] text-[#0e0e0e] hover:bg-[#d6f755] font-bold text-base px-8 rounded-full h-12"
              >
                Get started free
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/10 text-white/70 hover:text-white hover:border-white/20 text-base px-8 rounded-full h-12 bg-transparent"
              >
                See a demo →
              </Button>
            </div>
          </div>

          {/* Stats row */}
          <div className="animate-fade-up delay-500 mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
            {stats.map((s) => (
              <div key={s.label} className="bg-[#0e0e0e] px-6 py-6 md:py-8">
                <div className="font-mono text-3xl md:text-4xl font-bold text-[#c8f135] mb-1">
                  {s.value}
                </div>
                <div className="text-white/40 text-xs md:text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="relative overflow-hidden border-y border-white/5 bg-[#111] py-4">
        <div className="flex animate-marquee whitespace-nowrap">
          {tickers.map((t, i) => (
            <span key={i} className="inline-flex items-center gap-4 mx-6 font-mono text-sm text-white/30 uppercase tracking-widest">
              {t}
              <span className="text-[#c8f135]">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section id="features" className="px-6 md:px-12 py-28 max-w-7xl mx-auto">
        <div className="mb-16">
          <p className="font-mono text-xs text-[#c8f135] uppercase tracking-widest mb-4 animate-fade-up">
            / Features
          </p>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#f5f2eb] animate-fade-up delay-100">
            Everything you need.<br />
            <span className="text-white/25">Nothing you don&apos;t.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
          {features.map((f, i) => (
            <div
              key={f.num}
              className="card-hover bg-[#0e0e0e] p-8 border border-transparent animate-fade-up"
              style={{ animationDelay: `${0.1 + i * 0.07}s` }}
            >
              <div className="font-mono text-xs text-[#c8f135]/60 mb-6 uppercase tracking-widest">
                {f.num}
              </div>
              <h3 className="text-xl font-bold text-[#f5f2eb] mb-3">{f.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="px-6 md:px-12 py-28 bg-[#111] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs text-[#c8f135] uppercase tracking-widest mb-4">
            / How it works
          </p>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#f5f2eb] mb-20">
            Three steps.<br />
            <span className="text-white/25">That&apos;s actually it.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "1",
                title: "Connect your clients",
                desc: "Import from your contacts or add manually. Lekka remembers everything for next time.",
              },
              {
                step: "2",
                title: "Build your invoice",
                desc: "Choose a template, add your line items. Done in under a minute, guaranteed.",
              },
              {
                step: "3",
                title: "Send & get paid",
                desc: "Your client clicks one button. Money moves. You get a notification. Simple.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="font-mono text-8xl font-bold text-[#c8f135]/10 mb-4 leading-none select-none">
                  {item.step}
                </div>
                <Separator className="bg-[#c8f135]/30 w-12 h-px mb-6" />
                <h3 className="text-2xl font-bold text-[#f5f2eb] mb-3">{item.title}</h3>
                <p className="text-white/40 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 md:px-12 py-28 max-w-7xl mx-auto">
        <p className="font-mono text-xs text-[#c8f135] uppercase tracking-widest mb-4">
          / From the field
        </p>
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#f5f2eb] mb-16">
          Freelancers love it.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Card
              key={t.name}
              className="card-hover bg-[#161616] border-white/5 p-8 rounded-2xl animate-fade-up"
              style={{ animationDelay: `${0.1 + i * 0.12}s` }}
            >
              <p className="text-[#f5f2eb]/80 text-lg leading-relaxed mb-8">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <Avatar className="w-9 h-9 bg-[#c8f135]/10 border border-[#c8f135]/20">
                  <AvatarFallback className="text-[#c8f135] text-xs font-bold bg-transparent">
                    {t.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-semibold text-[#f5f2eb]">{t.name}</div>
                  <div className="text-xs text-white/40 font-mono">{t.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 md:px-12 py-28 bg-[#111] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs text-[#c8f135] uppercase tracking-widest mb-4">
            / Pricing
          </p>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#f5f2eb] mb-16">
            Honest pricing.<br />
            <span className="text-white/25">No surprises.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                plan: "Free",
                price: "$0",
                period: "/mo",
                desc: "For solo freelancers just getting started.",
                features: ["5 invoices/month", "2 clients", "PDF export", "Basic templates"],
                cta: "Start free",
                highlight: false,
              },
              {
                plan: "Solo",
                price: "$12",
                period: "/mo",
                desc: "Everything you need as a full-time freelancer.",
                features: ["Unlimited invoices", "Unlimited clients", "Auto reminders", "Multi-currency", "Stripe & PayPal"],
                cta: "Get started",
                highlight: true,
              },
              {
                plan: "Studio",
                price: "$29",
                period: "/mo",
                desc: "For small teams and agencies with multiple members.",
                features: ["Everything in Solo", "5 team members", "Client portal", "Custom branding", "Priority support"],
                cta: "Contact us",
                highlight: false,
              },
            ].map((p) => (
              <div
                key={p.plan}
                className={`rounded-2xl p-8 border transition-all ${
                  p.highlight
                    ? "bg-[#c8f135] border-[#c8f135] text-[#0e0e0e]"
                    : "bg-[#161616] border-white/5 text-[#f5f2eb] card-hover"
                }`}
              >
                <div className={`font-mono text-xs uppercase tracking-widest mb-6 ${p.highlight ? "text-[#0e0e0e]/60" : "text-[#c8f135]/60"}`}>
                  {p.plan}
                </div>
                <div className="flex items-end gap-1 mb-3">
                  <span className="text-5xl font-extrabold">{p.price}</span>
                  <span className={`mb-2 text-sm ${p.highlight ? "text-[#0e0e0e]/50" : "text-white/40"}`}>{p.period}</span>
                </div>
                <p className={`text-sm mb-8 ${p.highlight ? "text-[#0e0e0e]/60" : "text-white/40"}`}>{p.desc}</p>
                <ul className="space-y-3 mb-10">
                  {p.features.map((f) => (
                    <li key={f} className={`text-sm flex items-center gap-2 ${p.highlight ? "text-[#0e0e0e]/80" : "text-white/60"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.highlight ? "bg-[#0e0e0e]/40" : "bg-[#c8f135]/50"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full rounded-full font-bold ${
                    p.highlight
                      ? "bg-[#0e0e0e] text-[#c8f135] hover:bg-[#0e0e0e]/90"
                      : "bg-[#c8f135] text-[#0e0e0e] hover:bg-[#d6f755]"
                  }`}
                >
                  {p.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 py-32 max-w-7xl mx-auto text-center">
        <p className="font-mono text-xs text-[#c8f135] uppercase tracking-widest mb-6">
          / Ready?
        </p>
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-[#f5f2eb] mb-8 leading-[0.9]">
          Start billing<br />
          <span className="text-[#c8f135] lime-glow">smarter today.</span>
        </h2>
        <p className="text-white/40 text-lg max-w-md mx-auto mb-10">
          No credit card. No setup fee. Just cleaner invoicing from day one.
        </p>
        <Button
          size="lg"
          className="bg-[#c8f135] text-[#0e0e0e] hover:bg-[#d6f755] font-bold text-lg px-12 rounded-full h-14"
        >
          Create your first invoice free
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 md:px-12 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="font-mono text-lg font-bold text-[#c8f135]">lekka</span>
          <div className="flex items-center gap-6 text-sm text-white/30 font-mono">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/60 transition-colors">Status</a>
          </div>
          <p className="text-white/20 text-xs font-mono">
            © 2026 Lekka. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
