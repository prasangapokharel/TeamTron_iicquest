"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { MarketingContainer } from "./marketing-shell";

gsap.registerPlugin(ScrollTrigger);

const FAQ_ITEMS = [
  {
    q: "What documents can VivadX verify?",
    a: "VivadX supports PDFs and images — passports, citizenship certificates, licenses, invoices, contracts, and more. Upload 2–5 documents per verification session.",
  },
  {
    q: "How does blockchain signing work?",
    a: "When fields are verified (Green), VivadX hashes the verified data and signs it on the Tron network. A QR code is generated for public verification by regulators and auditors.",
  },
  {
    q: "Are my documents stored permanently?",
    a: "No. VivadX is privacy-first — raw documents are not stored permanently. Only verification metadata, flags, and blockchain hashes are retained in your register.",
  },
  {
    q: "Can banks integrate via API?",
    a: "Yes. Send documents to POST /api/v1/verify and receive JSON with field-level flags, risk score (0–100), and Tron hash — ready for your core banking systems.",
  },
  {
    q: "What industries does VivadX support?",
    a: "Banks, manpower agencies, consultancies, insurance firms, and more. Dynamic rule sets load per category — Bank KYC, Manpower, Consultancy — or you can pick fields manually.",
  },
  {
    q: "What do Red, Orange, and Green mean?",
    a: "Red flags critical issues or fraud risk. Orange indicates warnings that need review. Green means the field is verified correctly and eligible for blockchain signing.",
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
              Everything you need to know about VivadX document verification.
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
