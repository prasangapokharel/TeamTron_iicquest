"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Upload, Brain, Link2, Archive } from "lucide-react";
import { MarketingContainer } from "./marketing-shell";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    icon: Upload,
    step: "01",
    title: "Upload documents",
    desc: "Select criteria and upload 2–5 PDFs or images. Choose Bank KYC, Manpower, or custom rules.",
  },
  {
    icon: Brain,
    step: "02",
    title: "AI analyzes & flags",
    desc: "VivadX extracts fields dynamically and marks each Red, Orange, or Green with a risk score.",
  },
  {
    icon: Link2,
    step: "03",
    title: "Blockchain signing",
    desc: "Green fields get hashed and signed on Tron. Share the QR link so anyone can verify.",
  },
  {
    icon: Archive,
    step: "04",
    title: "Verification register",
    desc: "All successful checks saved in your secure dashboard with searchable audit history.",
  },
];

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      gsap.from(".step-card", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 78%", once: true },
        y: 28,
        opacity: 0,
        duration: 0.55,
        stagger: 0.1,
        ease: "power2.out",
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="marketing-section border-t border-[var(--border)]"
    >
      <MarketingContainer>
        <div className="section-header section-header-center">
          <p className="section-eyebrow">How it works</p>
          <h2 className="section-title">From upload to blockchain proof</h2>
          <p className="section-desc">
            Four simple steps to replace hours of manual document checking.
          </p>
        </div>

        <div className="steps-grid">
          {STEPS.map(({ icon: Icon, step, title, desc }) => (
            <article key={step} className="step-card">
              <div className="flex items-center justify-between">
                <div className="feature-icon">
                  <Icon size={20} strokeWidth={1.5} />
                </div>
                <span className="step-number">{step}</span>
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
