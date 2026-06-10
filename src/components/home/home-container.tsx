import { SiteNav } from "@/components/home/site-nav";
import { Hero } from "@/components/home/hero";
import { TrustStrip } from "@/components/home/trust-strip";
import { FeaturesGrid } from "@/components/home/features-grid";
import { HowItWorks } from "@/components/home/how-it-works";
import { ShowcaseLaptop } from "@/components/home/showcase-laptop";
import { Testimonials } from "@/components/home/testimonials";
import { Pricing } from "@/components/home/pricing";
import { Faq } from "@/components/home/faq";
import { CtaBand } from "@/components/home/cta-band";
import { SiteFooter } from "@/components/home/site-footer";

function HomeContainer() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <TrustStrip />
        <FeaturesGrid />
        <HowItWorks />
        <ShowcaseLaptop />
        <Testimonials />
        <Pricing />
        <Faq />
        <CtaBand />
      </main>
      <SiteFooter />
    </>
  );
}

export { HomeContainer };
