"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Clock, AlertTriangle, FileQuestion } from "lucide-react";
import { MarketingContainer } from "./marketing-shell";

gsap.registerPlugin(ScrollTrigger);

const PROBLEMS = [
  {
    icon: Clock,
    title: "Hours per case",
    desc: "Manual document checking takes 30 minutes to 3 hours per case — slowing operations and increasing backlog.",
  },
  {
    icon: AlertTriangle,
    title: "36,000+ pending DOFE",
    desc: "Banks face heavy workloads with scattered documents, high human error, and rising fraud risk.",
  },
  {
    icon: FileQuestion,
    title: "No audit trail",
    desc: "Without immutable proof, it's nearly impossible to demonstrate verification to regulators later.",
  },
];

export function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      gsap.from(".problem-card", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true },
        y: 32,
        opacity: 0,
        duration: 0.55,
        stagger: 0.12,
        ease: "power2.out",
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="marketing-section border-t border-[var(--border)]">
      <MarketingContainer>
        <div className="section-header section-header-center">
          <p className="section-eyebrow">The problem</p>
          <h2 className="section-title">The old way doesn&apos;t scale</h2>
          <p className="section-desc">
            Document reconciliation is still manual, error-prone, and impossible to audit at scale.
          </p>
        </div>

        <div className="problem-grid">
          {PROBLEMS.map(({ icon: Icon, title, desc }) => (
            <article key={title} className="problem-card">
              <div className="feature-icon mb-4">
                <Icon size={20} strokeWidth={1.5} className="text-[#f87171]" />
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
