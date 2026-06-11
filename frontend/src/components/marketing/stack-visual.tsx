"use client";

import { useRef, type CSSProperties } from "react";
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
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

const LEFT_TILES = [
  { icon: Upload, label: "Upload" },
  { icon: FileText, label: "Parse" },
  { icon: ScanLine, label: "OCR" },
  { icon: Brain, label: "Extract" },
  { icon: Shield, label: "KYC" },
] as const;

const RIGHT_TILES = [
  { icon: FileCheck, label: "Verify" },
  { icon: Link2, label: "Tron" },
  { icon: QrCode, label: "Proof" },
  { icon: Database, label: "Register" },
  { icon: Building2, label: "Banks" },
] as const;

/** Full pipeline cycle length (seconds) */
const FLOW_CYCLE_S = 8;
/** Gap between each step from VX outward */
const FLOW_STEP_S = 0.58;
const CONNECTOR_DELAY = FLOW_STEP_S;

function flowStyle(delay: number): CSSProperties {
  return {
    "--flow-delay": `${delay}s`,
    "--flow-cycle": `${FLOW_CYCLE_S}s`,
  } as CSSProperties;
}

/** Left branch: hub → KYC → … → Upload */
function leftNodeDelay(index: number) {
  return CONNECTOR_DELAY + FLOW_STEP_S * (LEFT_TILES.length - index);
}

/** Right branch: hub → Verify → … → Banks */
function rightNodeDelay(index: number) {
  return CONNECTOR_DELAY + FLOW_STEP_S * (index + 1);
}

function StackFlowBox({
  children,
  className,
  innerClassName,
  sequential = false,
  delay = 0,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  sequential?: boolean;
  delay?: number;
  title?: string;
}) {
  return (
    <div
      className={cn("stack-flow-box", sequential && "stack-flow-box--seq", className)}
      style={flowStyle(delay)}
      title={title}
    >
      <div className={cn("stack-flow-inner", innerClassName)}>{children}</div>
    </div>
  );
}

function StackTile({
  icon: Icon,
  label,
  delay,
}: {
  icon: (typeof LEFT_TILES)[number]["icon"];
  label: string;
  delay: number;
}) {
  return (
    <StackFlowBox
      className="stack-flow-box--tile"
      sequential
      delay={delay}
      innerClassName="stack-tile"
      title={label}
    >
      <Icon size={16} strokeWidth={1.5} aria-hidden />
    </StackFlowBox>
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

export function StackVisual({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      gsap.from(".stack-flow-box", {
        opacity: 0,
        y: 6,
        duration: 0.45,
        stagger: 0.035,
        ease: "power2.out",
      });
      gsap.from(".stack-connector", {
        scaleX: 0,
        opacity: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.15,
        transformOrigin: "center center",
      });
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className={cn("stack-visual", className)}>
      <div className="stack-visual-scene">
        <div className="stack-visual-plate" aria-hidden />
        <div className="stack-visual-ambient" aria-hidden />
        <div className="stack-stage">
          <div className="stack-column stack-column-left">
            {LEFT_TILES.map((tile, i) => (
              <StackTile key={tile.label} {...tile} delay={leftNodeDelay(i)} />
            ))}
          </div>

          <div className="stack-center">
            <div
              className="stack-connector stack-connector-left stack-connector--seq"
              style={flowStyle(CONNECTOR_DELAY)}
              aria-hidden
            />

            <StackFlowBox className="stack-flow-box--hub" innerClassName="stack-hub-card">
              <StackHubLogo />
            </StackFlowBox>

            <div
              className="stack-connector stack-connector-right stack-connector--seq"
              style={flowStyle(CONNECTOR_DELAY)}
              aria-hidden
            />
          </div>

          <div className="stack-column stack-column-right">
            {RIGHT_TILES.map((tile, i) => (
              <StackTile key={tile.label} {...tile} delay={rightNodeDelay(i)} />
            ))}
          </div>
        </div>
      </div>

      <p className="stack-visual-caption">Upload, verify, then anchor proof on chain</p>
    </div>
  );
}
