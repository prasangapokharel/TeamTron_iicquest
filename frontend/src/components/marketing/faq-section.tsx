"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { PLATFORM_NAME } from "@/lib/brand";
import { MarketingContainer } from "./marketing-shell";

gsap.registerPlugin(ScrollTrigger);

const FAQ_ITEMS = [
  {
    q: `What documents can ${PLATFORM_NAME} verify?`,
    a: "PDFs and images work: passports, citizenship, licenses, invoices, contracts, and more. Upload 2 to 5 files per run.",
  },
  {
    q: "How does blockchain signing work?",
    a: "When a field passes (Green), we hash the data and sign it on Tron. You get a QR link regulators can open without logging in.",
  },
  {
    q: "Are my documents stored permanently?",
    a: "No. We don't keep your raw files long term. We store the verification result, flags, and blockchain hash in your register.",
  },
  {
    q: "Can banks integrate via API?",
    a: "Yes. POST documents to /api/v1/verify and you get JSON with field flags, a 0-100 risk score, and the Tron hash for your core system.",
  },
  {
    q: `What industries does ${PLATFORM_NAME} support?`,
    a: "Banks, manpower agencies, consultancies, insurance, and similar teams. Pick a category pack or choose fields yourself.",
  },
  {
    q: "What do Red, Orange, and Green mean?",
    a: "Red is a serious issue or fraud signal. Orange needs a human look. Green means the field checked out and can be signed on chain.",
  },
] as const;

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const answerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);

  function toggle() {
    const answer = answerRef.current;
    const icon = iconRef.current;
    if (!answer || !icon) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (open) {
      if (reduced) {
        setOpen(false);
        return;
      }
      gsap.to(answer, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.inOut",
        onComplete: () => setOpen(false),
      });
      gsap.to(icon, { rotate: 0, duration: 0.25 });
    } else {
      setOpen(true);
      if (reduced) return;
      gsap.fromTo(
        answer,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.35, ease: "power2.out" }
      );
      gsap.to(icon, { rotate: 45, duration: 0.25 });
    }
  }

  return (
    <div className={`faq-item${open ? " faq-item-open" : ""}`}>
      <button type="button" className="faq-trigger" onClick={toggle} aria-expanded={open}>
        <span className="faq-question">{q}</span>
        <span ref={iconRef} className="faq-icon">
          <Plus size={18} strokeWidth={1.5} />
        </span>
      </button>
      {open && (
        <div ref={answerRef} className="faq-answer-wrap">
          <p className="faq-answer">{a}</p>
        </div>
      )}
    </div>
  );
}

export function FaqSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      gsap.from(".faq-aside", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true },
        x: -24,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      });

      gsap.from(".faq-item", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true },
        y: 20,
        opacity: 0,
        duration: 0.45,
        stagger: 0.06,
        ease: "power2.out",
      });
    },
    { scope: sectionRef }
  );

  return (
    <section id="faq" ref={sectionRef} className="faq-section">
      <MarketingContainer>
        <div className="faq-layout">
          <aside className="faq-aside">
            <p className="section-eyebrow">FAQ</p>
            <h2 className="faq-title">Common questions</h2>
            <p className="faq-aside-desc">
              Everything you need to know about {PLATFORM_NAME} document verification.
              Need more help?{" "}
              <a href="mailto:hello@vivadx.io">Contact us</a>.
            </p>
          </aside>

          <div className="faq-list">
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.q} {...item} />
            ))}
          </div>
        </div>

        <div className="faq-cta">
          <p className="faq-cta-text">Ready to start verifying smarter?</p>
          <Link href="/signup" className="btn-primary">
            Create free account
          </Link>
        </div>
      </MarketingContainer>
    </section>
  );
}
