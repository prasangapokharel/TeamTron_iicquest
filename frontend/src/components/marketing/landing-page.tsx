import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingPageShell } from "./marketing-page-shell";
import { MarketingContainer } from "./marketing-shell";
import { HeroSection } from "./hero-section";
import { ProblemSection } from "./problem-section";
import { HowItWorksSection } from "./how-it-works-section";
import { FeaturesSection } from "./features-section";
import { MetricsSection } from "./metrics-section";
import { ApiSection } from "./api-section";
import { FaqSection } from "./faq-section";
import { PLATFORM_NAME } from "@/lib/brand";

export function LandingPage() {
  return (
    <MarketingPageShell>
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesSection />
      <MetricsSection />
      <ApiSection />
      <FaqSection />

      <section className="marketing-section marketing-section-last">
        <MarketingContainer className="narrow">
          <div className="cta-banner">
            <h2 className="section-title">Ready to verify smarter with {PLATFORM_NAME}?</h2>
            <p className="section-desc">
              Join banks and agencies replacing hours of manual checks with seconds of AI verification.
            </p>
            <Link href="/signup" className="btn-primary cta-banner-btn">
              Start free today
              <ArrowRight size={18} />
            </Link>
          </div>
        </MarketingContainer>
      </section>
    </MarketingPageShell>
  );
}
