"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Github, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { MarketingAnchorLink } from "./marketing-anchor-link";
import {
  scrollToMarketingSection,
  setMarketingNavHeightVar,
  parseSectionId,
  setMarketingHash,
} from "./marketing-scroll";

const SUBNAV_DISMISS_KEY = "vivadx-subnav-dismissed";
const SUBNAV_SCROLL_THRESHOLD = 48;

const NAV_LINKS = [
  { href: "/#features", label: "Products", chevron: true },
  { href: "/#how-it-works", label: "Blogs" },
  { href: "/#api", label: "Docs" },
  { href: "/#how-it-works", label: "Integrations" },
  { href: "/#features", label: "Templates" },
  { href: "/#metrics", label: "Pricing" },
  { href: "/#faq", label: "Roadmap" },
];

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export function MarketingContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("marketing-container", className)}>{children}</div>
  );
}

export function MarketingHeader() {
  const pathname = usePathname();
  const subNavRef = useRef<HTMLDivElement>(null);
  const [dismissed, setDismissed] = useState(false);
  const [scrollHidden, setScrollHidden] = useState(false);

  const subNavHidden = dismissed || scrollHidden;

  const updateNavHeight = useCallback(() => {
    requestAnimationFrame(() => setMarketingNavHeightVar());
  }, []);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(SUBNAV_DISMISS_KEY) === "1");
    updateNavHeight();
  }, [updateNavHeight]);

  useEffect(() => {
    function onResize() {
      updateNavHeight();
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [updateNavHeight]);

  useEffect(() => {
    if (dismissed) return;

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const hidden = window.scrollY > SUBNAV_SCROLL_THRESHOLD;
        setScrollHidden((prev) => {
          if (prev !== hidden) updateNavHeight();
          return hidden;
        });
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed, updateNavHeight]);

  useEffect(() => {
    const subNav = subNavRef.current;
    if (!subNav) return;

    const onTransitionEnd = (e: TransitionEvent) => {
      if (e.target !== subNav) return;
      if (e.propertyName === "max-height" || e.propertyName === "opacity") {
        updateNavHeight();
      }
    };

    subNav.addEventListener("transitionend", onTransitionEnd);
    return () => subNav.removeEventListener("transitionend", onTransitionEnd);
  }, [updateNavHeight]);

  const dismissSubNav = () => {
    setDismissed(true);
    setScrollHidden(false);
    sessionStorage.setItem(SUBNAV_DISMISS_KEY, "1");
    updateNavHeight();
  };

  useEffect(() => {
    if (pathname !== "/") return;

    const sectionId = parseSectionId(window.location.hash);
    if (!sectionId) return;

    if (window.location.hash !== `#${sectionId}`) {
      setMarketingHash(sectionId);
    }

    let attempts = 0;
    let raf = 0;

    const tryScroll = () => {
      const scrolled = scrollToMarketingSection(sectionId, attempts > 0);
      if (!scrolled && attempts < 12) {
        attempts += 1;
        raf = requestAnimationFrame(tryScroll);
        return;
      }
      setMarketingNavHeightVar();
    };

    const timer = window.setTimeout(tryScroll, 80);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return (
    <header className="marketing-nav">
      <div
        ref={subNavRef}
        className={cn(
          "marketing-nav-sub marketing-bordered",
          subNavHidden && "marketing-nav-sub--hidden"
        )}
      >
        <p className="marketing-nav-sub-text">Powered by IIC Quest 4.0 Hackathon</p>
        <button
          type="button"
          className="marketing-nav-sub-close"
          onClick={dismissSubNav}
          aria-label="Dismiss announcement"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>
      <div className="marketing-nav-inner marketing-bordered">
        <div className="nav-left">
          <div className="nav-brand">
            <Logo size="md" />
          </div>

          <nav className="nav-links-wrap" aria-label="Main">
            <div className="nav-links">
              {NAV_LINKS.map(({ href, label, chevron }) => {
                const LinkComponent = href.includes("#")
                  ? MarketingAnchorLink
                  : Link;

                return (
                  <LinkComponent
                    key={`${href}-${label}`}
                    href={href}
                    className="nav-link"
                  >
                    {label}
                    {chevron ? <ChevronDown size={14} className="nav-link-chevron" /> : null}
                  </LinkComponent>
                );
              })}
            </div>
          </nav>
        </div>

        <div className="nav-actions">
          <a
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-social"
            aria-label="Discord"
          >
            <DiscordIcon className="w-[18px] h-[18px]" />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-github"
            aria-label="GitHub"
          >
            <Github size={18} />
            <span className="nav-github-stars">11.6k</span>
          </a>
          <Link href="/login" className="nav-text-btn">
            Login
          </Link>
          <Link href="/signup" className="btn-nav-signup">
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="marketing-footer">
      <MarketingContainer>
        <div className="footer-top">
          <div className="footer-brand">
            <Logo />
            <p className="footer-tagline">
              Smart document reconciliation and verification — powered by AI and
              anchored on the Tron blockchain.
            </p>
            <Link href="/signup" className="btn-primary footer-cta">
              Get started
            </Link>
          </div>

          <div className="footer-links-grid">
            <div className="footer-col">
              <p className="footer-heading">Product</p>
              <ul className="footer-links">
                <li>
                  <MarketingAnchorLink href="/#features">Features</MarketingAnchorLink>
                </li>
                <li>
                  <MarketingAnchorLink href="/#how-it-works">How it works</MarketingAnchorLink>
                </li>
                <li>
                  <MarketingAnchorLink href="/#api">API</MarketingAnchorLink>
                </li>
                <li>
                  <MarketingAnchorLink href="/#faq">FAQ</MarketingAnchorLink>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <p className="footer-heading">Industries</p>
              <ul className="footer-links">
                <li>Banks &amp; KYC</li>
                <li>Manpower Agencies</li>
                <li>Consultancies</li>
                <li>Insurance</li>
              </ul>
            </div>

            <div className="footer-col">
              <p className="footer-heading">Account</p>
              <ul className="footer-links">
                <li>
                  <Link href="/login">Log in</Link>
                </li>
                <li>
                  <Link href="/signup">Sign up</Link>
                </li>
                <li>
                  <Link href="/dashboard">Dashboard</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">© {year} VivadX. All rights reserved.</p>
          <p className="footer-meta">
            Verification proofs secured on Tron Network
          </p>
        </div>
      </MarketingContainer>
    </footer>
  );
}
