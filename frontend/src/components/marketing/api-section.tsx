"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Copy, Terminal } from "lucide-react";
import { PLATFORM_NAME } from "@/lib/brand";
import { MarketingContainer } from "./marketing-shell";

gsap.registerPlugin(ScrollTrigger);

const CODE = `POST /api/v1/verify
Content-Type: multipart/form-data

{
  "criteria": "bank_kyc",
  "documents": ["passport.pdf", "citizenship.jpg"]
}

// Response
{
  "risk_score": 72,
  "flags": {
    "full_name": { "status": "green", "value": "Ram B. Thapa" },
    "expiry_date": { "status": "red", "value": "2023-08-15" }
  },
  "tron_hash": "0x7f3a9c2e1b4d8f6a0c91e...",
  "qr_url": "https://vivadx.io/verify/abc123"
}`;

export function ApiSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      gsap.from(".api-content", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true },
        y: 36,
        opacity: 0,
        duration: 0.65,
        ease: "power2.out",
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="api"
      ref={sectionRef}
      className="marketing-section border-t border-[var(--border)]"
    >
      <MarketingContainer>
        <div className="api-content grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="hero-badge mb-4">
              <Terminal size={14} />
              <span>Enterprise API</span>
            </div>
            <h2 className="section-title">Integrate {PLATFORM_NAME} into your workflow</h2>
            <p className="section-desc mt-3">
              Banks and large enterprises can send documents programmatically and receive
              structured JSON with flags, risk scores, and Tron hashes.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-[var(--text-muted)]">
              {[
                "RESTful POST /api/v1/verify endpoint",
                "Multipart document upload support",
                "Webhook callbacks for async processing",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[var(--primary)] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="api-code-block">
            <div className="api-code-header">
              <div className="api-code-dots">
                <span className="bg-[#f87171]" />
                <span className="bg-[#fbbf24]" />
                <span className="bg-[#4ade80]" />
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                onClick={() => navigator.clipboard?.writeText(CODE)}
              >
                <Copy size={14} />
                Copy
              </button>
            </div>
            <pre className="api-code-pre">
              <code>{CODE}</code>
            </pre>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
