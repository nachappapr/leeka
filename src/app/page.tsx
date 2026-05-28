import type { Metadata } from "next"

import { HomeContainer } from "@/components/home/home-container"

export const metadata: Metadata = {
  title: "ArthaPatra — Invoicing as easy as a WhatsApp",
  description:
    "Free invoicing app made for India's small shops, home bakers, tailors and traders. Send on WhatsApp, get paid faster. EN + हिंदी.",
}

export default function HomePage() {
  return <HomeContainer />
}
