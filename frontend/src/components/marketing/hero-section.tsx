"use client";

import { useRef, useCallback, useState } from "react";
import Link from "next/link";
import { Scale } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { MarketingAnchorLink } from "./marketing-anchor-link";
import { MarketingContainer } from "./marketing-shell";
import { cn } from "@/lib/utils";
import { TrustedSection } from "./trusted-section";
import { StackVisual } from "./stack-visual";

function HeroWalkingMascot() {
  return (
    <div className="hero-walking-mascot" aria-hidden>
      <svg viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="10" width="14" height="12" fill="#9ca3af" />
        <rect x="7" y="6" width="10" height="5" fill="#d1d5db" />
        <rect x="9" y="13" width="2" height="2" fill="#374151" />
        <rect x="13" y="13" width="2" height="2" fill="#374151" />
        <rect x="10" y="17" width="4" height="1" fill="#374151" />
        <rect x="6" y="22" width="3" height="4" fill="#6b7280" className="hero-mascot-leg hero-mascot-leg-left" />
        <rect x="15" y="22" width="3" height="4" fill="#6b7280" className="hero-mascot-leg hero-mascot-leg-right" />
        <rect x="3" y="12" width="2" height="4" fill="#9ca3af" />
        <rect x="19" y="12" width="2" height="4" fill="#9ca3af" />
      </svg>
    </div>
  );
}

function HeroCtaWithMascot() {
  const trackRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLAnchorElement>(null);
  const secondaryRef = useRef<HTMLAnchorElement>(null);
  const mascotRef = useRef<HTMLDivElement>(null);
  const walkTweenRef = useRef<gsap.core.Tween | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [readDocActive, setReadDocActive] = useState(false);
  const [readDocHit, setReadDocHit] = useState(false);

  const setupWalk = useCallback(() => {
    const track = trackRef.current;
    const primary = primaryRef.current;
    const secondary = secondaryRef.current;
    const mascot = mascotRef.current;
    if (!track || !primary || !secondary || !mascot) return;

    gsap.killTweensOf(mascot);
    gsap.killTweensOf(secondary);
    gsap.killTweensOf(mascot.querySelectorAll(".hero-mascot-leg"));
    timelineRef.current?.kill();
    walkTweenRef.current?.kill();
    setReadDocActive(false);
    setReadDocHit(false);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isRow = window.matchMedia("(min-width: 480px)").matches;

    const trackRect = track.getBoundingClientRect();
    const primaryRect = primary.getBoundingClientRect();
    const secondaryRect = secondary.getBoundingClientRect();

    const mascotW = mascot.offsetWidth || 28;
    const topY = -30;

    if (!isRow || reduced) {
      gsap.set(mascot, {
        x: primaryRect.right - trackRect.left - mascotW * 0.6,
        y: topY,
        scaleX: 1,
        opacity: 1,
      });
      return;
    }

    const startX = primaryRect.right - trackRect.left - mascotW * 0.85;
    const endX = secondaryRect.left - trackRect.left + mascotW * 0.15;

    gsap.set(mascot, { x: startX, y: topY, scaleX: 1, opacity: 1 });

    const legs = mascot.querySelectorAll(".hero-mascot-leg");
    walkTweenRef.current = gsap.to(mascot, {
      y: topY - 3,
      duration: 0.12,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });

    if (legs.length === 2) {
      gsap.to(legs[0], { y: 1, duration: 0.12, repeat: -1, yoyo: true, ease: "power1.inOut" });
      gsap.to(legs[1], { y: -1, duration: 0.12, repeat: -1, yoyo: true, ease: "power1.inOut" });
    }

    const tapReadDoc = () => {
      walkTweenRef.current?.pause();

      gsap
        .timeline({
          onComplete: () => {
            setReadDocHit(false);
            setReadDocActive(true);
            walkTweenRef.current?.resume();
          },
        })
        .to(mascot, { y: topY + 14, duration: 0.09, ease: "power2.in" })
        .to(
          secondary,
          { scale: 0.9, y: 3, duration: 0.09, ease: "power2.in" },
          "<"
        )
        .add(() => setReadDocHit(true))
        .to(mascot, { y: topY - 2, duration: 0.14, ease: "power2.out" })
        .to(
          secondary,
          { scale: 1.06, y: 0, duration: 0.32, ease: "back.out(2.8)" },
          "<0.04"
        )
        .to(secondary, { scale: 1, duration: 0.18, ease: "power2.out" });
    };

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
    tl.to(mascot, {
      x: endX,
      duration: 2.8,
      ease: "steps(14)",
      onStart: () => {
        gsap.set(mascot, { scaleX: 1 });
        setReadDocActive(false);
        setReadDocHit(false);
      },
      onComplete: tapReadDoc,
    })
      .to(mascot, { duration: 1.35 })
      .to(mascot, {
        x: startX,
        duration: 2.8,
        ease: "steps(14)",
        onStart: () => {
          gsap.set(mascot, { scaleX: -1 });
          setReadDocActive(false);
          setReadDocHit(false);
          gsap.set(secondary, { scale: 1, y: 0 });
        },
      })
      .to(mascot, { duration: 1.2 });

    timelineRef.current = tl;
  }, []);

  useGSAP(
    () => {
      setupWalk();
      window.addEventListener("resize", setupWalk);
      return () => {
        window.removeEventListener("resize", setupWalk);
        timelineRef.current?.kill();
        walkTweenRef.current?.kill();
      };
    },
    { scope: trackRef }
  );

  return (
    <div className="hero-cta-track" ref={trackRef}>
      <Link href="/signup" className="btn-hero-primary" ref={primaryRef}>
        Start Verifying Today
      </Link>
      <MarketingAnchorLink
        href="/#api"
        ref={secondaryRef}
        className={cn(
          "btn-hero-outline",
          readDocHit && "btn-hero-outline-hit",
          readDocActive && "btn-hero-outline-active"
        )}
      >
        <span className="btn-hero-ripple" aria-hidden />
        Read Doc
      </MarketingAnchorLink>
      <div ref={mascotRef}>
        <HeroWalkingMascot />
      </div>
    </div>
  );
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-badge", { y: 16, opacity: 0, duration: 0.45 })
        .from(".hero-title-line", { y: 28, opacity: 0, duration: 0.55, stagger: 0.08 }, "-=0.15")
        .from(".hero-subtitle", { y: 16, opacity: 0, duration: 0.45 }, "-=0.25")
        .from(".hero-cta > *", { y: 14, opacity: 0, duration: 0.4, stagger: 0.08 }, "-=0.2")
        .from(".hero-stack-visual", { y: 24, opacity: 0, duration: 0.6 }, "-=0.35");
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="marketing-hero marketing-hero-insforge">
      <div className="hero-grid-overlay" aria-hidden />
      <MarketingContainer>
        <div className="hero-insforge-layout">
          <div className="hero-copy-insforge">
            <div className="hero-badge hero-badge-api">
              <span className="hero-badge-icon" aria-hidden>
                <Scale size={13} strokeWidth={2.25} />
              </span>
              <span>
                <span className="hero-badge-highlight">36,000+</span> pending cases.{" "}
                <span className="hero-badge-highlight">3 hours down to 6 seconds</span>
              </span>
            </div>

            <h1 className="hero-title-insforge">
              <span className="hero-title-line">
                Smart Document{" "}
                <span className="hero-title-accent">Reconciliation</span>
              </span>
              <span className="hero-title-line">&amp; Verification</span>
            </h1>

            <p className="hero-subtitle hero-subtitle-insforge">
              Compare complaint, contract, license and receipt in one pass.
              When rules spot a mismatch, your system gets{" "}
              <strong className="hero-subtitle-emphasis">BLOCK</strong> or{" "}
              <strong className="hero-subtitle-emphasis">APPROVE</strong> from the API.
            </p>

            <div className="hero-cta hero-cta-insforge">
              <HeroCtaWithMascot />
            </div>
          </div>

          <div id="demo" className="hero-stack-visual">
            <StackVisual />
          </div>
        </div>

        <div className="hero-divider" aria-hidden />
        <TrustedSection />
      </MarketingContainer>
    </section>
  );
}
