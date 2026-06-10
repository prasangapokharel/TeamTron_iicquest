"use client";

import { useCallback, useRef, useState } from "react";
import {
  Building2,
  FileCheck,
  FileText,
  Link2,
  QrCode,
  ScanLine,
  Shield,
  Upload,
  Database,
  Brain,
  Sparkles,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

const LEFT_TILES = [
  { icon: Upload, label: "Upload" },
  { icon: FileText, label: "Parse" },
  { icon: ScanLine, label: "OCR" },
  { icon: Brain, label: "AI" },
  { icon: Shield, label: "KYC" },
] as const;

const RIGHT_TILES = [
  { icon: FileCheck, label: "Verify" },
  { icon: Link2, label: "Tron" },
  { icon: QrCode, label: "Proof" },
  { icon: Database, label: "Register" },
  { icon: Building2, label: "Banks" },
] as const;

const LIGHTNING_BOLTS = [0, 45, 90, 135, 180, 225, 270, 315] as const;

function StackTile({
  icon: Icon,
  label,
  fade,
  side,
  index,
}: {
  icon: (typeof LEFT_TILES)[number]["icon"];
  label: string;
  fade: number;
  side: "left" | "right";
  index: number;
}) {
  return (
    <div
      className={cn("stack-tile", `stack-tile-${side}`)}
      style={{ opacity: fade }}
      title={label}
      data-tile-index={index}
      data-tile-side={side}
    >
      <Icon size={18} strokeWidth={1.5} />
    </div>
  );
}

function StackHubLogo() {
  return (
    <div className="stack-hub-logo" aria-hidden>
      <span className="stack-hub-v">V</span>
      <span className="stack-hub-x">X</span>
    </div>
  );
}

const LEFT_FADES = [0.95, 0.72, 0.48, 0.32, 0.2];
const RIGHT_FADES = [0.95, 0.72, 0.48, 0.32, 0.2];

export function StackVisual({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLButtonElement>(null);
  const [poweredUp, setPoweredUp] = useState(false);
  const [charging, setCharging] = useState(false);
  const animatingRef = useRef(false);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.from(".stack-hub-card", {
        scale: 0.88,
        opacity: 0,
        duration: 0.65,
        ease: "back.out(1.4)",
      })
        .from(
          ".stack-tile",
          { y: 16, opacity: 0, duration: 0.45, stagger: 0.06 },
          "-=0.35"
        )
        .from(
          ".stack-connector",
          { scaleX: 0, opacity: 0, duration: 0.5, stagger: 0.1, transformOrigin: "center center" },
          "-=0.4"
        );
    },
    { scope: rootRef }
  );

  const runPowerUp = useCallback(() => {
    if (animatingRef.current || poweredUp) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setPoweredUp(true);
      return;
    }

    animatingRef.current = true;
    setCharging(true);

    const hub = hubRef.current;
    const root = rootRef.current;
    if (!hub || !root) {
      animatingRef.current = false;
      setCharging(false);
      setPoweredUp(true);
      return;
    }

    const lightning = root.querySelectorAll(".stack-lightning-bolt");
    const shockwave = root.querySelector(".stack-hub-shockwave");
    const leftEnergy = root.querySelector(".stack-connector-left .stack-connector-energy");
    const rightEnergy = root.querySelector(".stack-connector-right .stack-connector-energy");
    const leftTiles = root.querySelectorAll(".stack-tile-left");
    const rightTiles = root.querySelectorAll(".stack-tile-right");
    const premiumBadge = root.querySelector(".stack-hub-premium-badge");

    gsap.killTweensOf([
      hub,
      lightning,
      shockwave,
      leftEnergy,
      rightEnergy,
      leftTiles,
      rightTiles,
      premiumBadge,
    ]);

    const tl = gsap.timeline({
      onComplete: () => {
        setCharging(false);
        setPoweredUp(true);
        animatingRef.current = false;
      },
    });

    tl.to(hub, { scale: 0.92, duration: 0.08, ease: "power2.in" })
      .to(hub, { scale: 1.12, duration: 0.22, ease: "back.out(3)" })
      .to(
        shockwave,
        { scale: 2.8, opacity: 0, duration: 0.65, ease: "power2.out" },
        "<0.05"
      )
      .fromTo(
        lightning,
        { opacity: 0, scaleY: 0.2 },
        {
          opacity: 1,
          scaleY: 1,
          duration: 0.06,
          stagger: 0.02,
          ease: "power4.out",
        },
        "<"
      )
      .to(lightning, { opacity: 0, duration: 0.12, stagger: 0.015 }, "+=0.08")
      .to(lightning, { opacity: 0.9, duration: 0.04, stagger: 0.01 }, "+=0.02")
      .to(lightning, { opacity: 0, duration: 0.1, stagger: 0.01 })
      .fromTo(
        leftEnergy,
        { scaleX: 0, opacity: 0, transformOrigin: "right center" },
        { scaleX: 1, opacity: 1, duration: 0.45, ease: "power2.inOut" },
        "-=0.15"
      )
      .fromTo(
        rightEnergy,
        { scaleX: 0, opacity: 0, transformOrigin: "left center" },
        { scaleX: 1, opacity: 1, duration: 0.45, ease: "power2.inOut" },
        "<"
      )
      .to(
        leftTiles,
        {
          scale: 1.15,
          opacity: 1,
          duration: 0.28,
          stagger: 0.07,
          ease: "back.out(2)",
        },
        "-=0.2"
      )
      .to(
        rightTiles,
        {
          scale: 1.15,
          opacity: 1,
          duration: 0.28,
          stagger: 0.07,
          ease: "back.out(2)",
        },
        "-=0.22"
      )
      .to(leftTiles, { scale: 1, duration: 0.2, stagger: 0.04, ease: "power2.out" }, "-=0.05")
      .to(rightTiles, { scale: 1, duration: 0.2, stagger: 0.04, ease: "power2.out" }, "<")
      .to(hub, { scale: 1.05, duration: 0.35, ease: "elastic.out(1, 0.5)" }, "-=0.25")
      .fromTo(
        premiumBadge,
        { opacity: 0, y: 8, scale: 0.85 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(2.5)" },
        "-=0.15"
      );
  }, [poweredUp]);

  return (
    <div
      ref={rootRef}
      className={cn(
        "stack-visual",
        charging && "stack-visual--charging",
        poweredUp && "stack-visual--premium",
        className
      )}
    >
      <div className="stack-visual-glow" aria-hidden />
      <div className="stack-visual-glow stack-visual-glow-premium" aria-hidden />

      <div className="stack-stage">
        <div className="stack-column stack-column-left">
          {LEFT_TILES.map((tile, i) => (
            <StackTile key={tile.label} {...tile} fade={LEFT_FADES[i]} side="left" index={i} />
          ))}
        </div>

        <div className="stack-center">
          <div className="stack-connector stack-connector-left" aria-hidden>
            <span className="stack-connector-energy" />
          </div>

          <button
            ref={hubRef}
            type="button"
            className={cn(
              "stack-hub-card",
              charging && "stack-hub-card--charging",
              poweredUp && "stack-hub-card--premium"
            )}
            onClick={runPowerUp}
            disabled={poweredUp || charging}
            aria-label={poweredUp ? "VX engine powered up" : "Activate VX engine"}
          >
            <span className="stack-hub-shockwave" aria-hidden />
            <span className="stack-hub-lightning" aria-hidden>
              {LIGHTNING_BOLTS.map((deg) => (
                <span
                  key={deg}
                  className="stack-lightning-bolt"
                  style={{ transform: `rotate(${deg}deg)` }}
                />
              ))}
            </span>
            <span className="stack-hub-shine" aria-hidden />
            <StackHubLogo />
            <span className="stack-hub-premium-badge">
              <Sparkles size={11} strokeWidth={2.25} />
              Premium
            </span>
          </button>

          <div className="stack-connector stack-connector-right" aria-hidden>
            <span className="stack-connector-energy" />
          </div>
        </div>

        <div className="stack-column stack-column-right">
          {RIGHT_TILES.map((tile, i) => (
            <StackTile key={tile.label} {...tile} fade={RIGHT_FADES[i]} side="right" index={i} />
          ))}
        </div>
      </div>

      {!poweredUp && !charging && (
        <p className="stack-visual-hint">Tap VX to power up</p>
      )}
    </div>
  );
}
