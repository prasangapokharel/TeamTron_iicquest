"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

const TRUSTED_LOGOS = [
  { name: "IIC Quest", src: "/logos/iicquest.png", width: 498, height: 501, local: true },
  { name: "Leapfrog", src: "/logos/leapfrog.png", width: 1200, height: 1200, local: true },
  { name: "Google", src: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", width: 74, height: 24, local: false },
  { name: "Microsoft", src: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg", width: 88, height: 20, local: false },
  { name: "AWS", src: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg", width: 72, height: 28, local: false },
  { name: "LinkedIn", src: "https://upload.wikimedia.org/wikipedia/commons/0/01/LinkedIn_Logo.svg", width: 84, height: 22, local: false },
  { name: "Stripe", src: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg", width: 62, height: 26, local: false },
  { name: "Salesforce", src: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg", width: 88, height: 24, local: false },
  { name: "Slack", src: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Slack_Technologies_Logo.svg", width: 72, height: 22, local: false },
  { name: "IBM", src: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg", width: 72, height: 28, local: false },
] as const;

function LogoTile({ name, src, width, height, local }: (typeof TRUSTED_LOGOS)[number]) {
  return (
    <div className="trusted-marquee-slot" title={name}>
      <Image
        src={src}
        alt={name}
        width={width}
        height={height}
        className={cn(
          "trusted-marquee-img",
          local && "trusted-marquee-img-local"
        )}
        unoptimized
      />
    </div>
  );
}

function MarqueeGroup() {
  return (
    <>
      {TRUSTED_LOGOS.map((logo) => (
        <LogoTile key={logo.name} {...logo} />
      ))}
    </>
  );
}

export function TrustedSection() {
  const [paused, setPaused] = useState(false);

  return (
    <div
      className="trusted-strip"
      aria-label="Works perfectly with"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="trusted-strip-head">
        <p className="trusted-strip-label">
          <span className="trusted-strip-label-line">Works perfectly</span>
          <span className="trusted-strip-label-line">with</span>
        </p>
      </div>

      <div className="trusted-strip-scroll">
        <div className="trusted-marquee-fade trusted-marquee-fade-left" aria-hidden />
        <div className="trusted-marquee-fade trusted-marquee-fade-right" aria-hidden />

        <div className="trusted-marquee-viewport">
          <div
            className={cn(
              "trusted-marquee-track",
              paused && "trusted-marquee-paused"
            )}
          >
            <div className="trusted-marquee-group">
              <MarqueeGroup />
            </div>
            <div className="trusted-marquee-group" aria-hidden>
              <MarqueeGroup />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
