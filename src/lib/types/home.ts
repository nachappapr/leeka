import type { ComponentType } from "react"

export type Feature = {
  id: string
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  tone?: "default" | "lg"
}

export type Step = {
  id: string
  n: 1 | 2 | 3
  title: string
  description: string
  illustration: ComponentType
}

export type Testimonial = {
  id: string
  quote: string
  author: string
  role: string
  location: string
  rating: 1 | 2 | 3 | 4 | 5
  initials: string
}

export type PricingPlan = {
  id: string
  name: string
  tagline: string
  price: string
  period: string
  features: string[]
  ctaLabel: string
  ctaHref: string
  highlighted: boolean
}

export type Faq = {
  id: string
  question: string
  answer: string
}

export type FooterNavGroup = {
  id: string
  heading: string
  links: { label: string; href: string }[]
}

export type FooterLang = {
  code: string
  label: string
}

export type TrustItem =
  | { id: string; kind: "emphasis"; emphasis: string; label: string }
  | { id: string; kind: "rating"; rating: number; outOf: number; label: string }
  | { id: string; kind: "flag"; label: string }

export type HeroMetaItem = {
  id: string
  label: string
}
