"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  Zap,
  Sliders,
  Lock,
  Blocks,
  Code2,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { MarketingContainer } from "./marketing-shell";

gsap.registerPlugin(ScrollTrigger);

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Zap,
    title: "Results in seconds",
    desc: "Replace 30-minute manual checks with AI-powered analysis in under 10 seconds.",
  },
  {
    icon: Sliders,
    title: "Dynamic rules engine",
    desc: "Use built-in packs like Bank KYC or Manpower, or pick the fields you care about.",
  },
  {
    icon: Lock,
    title: "Privacy-first",
    desc: "Raw documents are not stored permanently. Only verification metadata and hashes are retained.",
  },
  {
    icon: Blocks,
    title: "Tron blockchain proof",
    desc: "Verified fields are signed on Tron for regulator-trusted, tamper-proof audit trails.",
  },
  {
    icon: Code2,
    title: "Bank-ready API",
    desc: "Hit POST /api/v1/verify and get flags, risk score, and Tron hash back as JSON.",
  },
  {
    icon: BarChart3,
    title: "Risk scoring",
    desc: "Clear 0–100 risk score with Red, Orange, and Green field-level visual flags.",
  },
];

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const header = sectionRef.current?.querySelector(".features-header");
      const cards = sectionRef.current?.querySelectorAll(".feature-card");
      if (!header || !cards?.length) return;

      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: "top 78%", once: true },
        defaults: { ease: "power3.out" },
      });

      tl.from(header.children, {
        y: 28,
        opacity: 0,
        duration: 0.65,
        stagger: 0.12,
      }).from(
        cards,
        { y: 36, opacity: 0, duration: 0.55, stagger: 0.07 },
        "-=0.35"
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="features"
      ref={sectionRef}
      className="marketing-section features-section border-t border-[var(--border)]"
    >
      <MarketingContainer>
        <div className="section-header section-header-center features-header">
          <p className="section-eyebrow">Features</p>
          <h2 className="section-title">Everything you need to verify at scale</h2>
          <p className="section-desc">
            VivadX saves 50–70% staff cost while giving auditors the proof they demand.
          </p>
        </div>

        <div className="features-grid">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <article key={title} className="feature-card">
              <div className="feature-icon">
                <Icon size={20} strokeWidth={1.5} />
              </div>
              <h3 className="feature-card-title">{title}</h3>
              <p className="feature-card-desc">{desc}</p>
            </article>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
