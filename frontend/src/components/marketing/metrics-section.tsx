"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MarketingContainer } from "./marketing-shell";

gsap.registerPlugin(ScrollTrigger);

const METRICS = [
  { value: 70, suffix: "%", label: "Staff cost savings" },
  { value: 10, suffix: "s", label: "Average analysis time" },
  { value: 100, suffix: "%", label: "Immutable audit trail" },
];

export function MetricsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const els = sectionRef.current?.querySelectorAll(".metric-counter");
      if (!els?.length) return;

      els.forEach((el, i) => {
        const target = METRICS[i].value;
        if (reduced) {
          el.textContent = String(target);
          return;
        }

        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%", once: true },
          onUpdate: () => {
            el.textContent = String(Math.round(obj.val));
          },
        });
      });
    },
    { scope: sectionRef }
  );

  return (
    <section id="metrics" ref={sectionRef} className="metrics-row">
      <MarketingContainer>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {METRICS.map((metric) => (
            <div key={metric.label} className="metric-item">
              <p className="metric-value text-[var(--primary)]">
                <span className="metric-counter">0</span>
                <span className="metric-suffix">{metric.suffix}</span>
              </p>
              <p className="metric-label">{metric.label}</p>
            </div>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
