"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  parseSectionId,
  scrollToMarketingSection,
  setMarketingHash,
} from "./marketing-scroll";

export const MarketingAnchorLink = forwardRef<
  HTMLAnchorElement,
  {
    href: string;
    className?: string;
    children: React.ReactNode;
    onClick?: () => void;
  }
>(function MarketingAnchorLink({ href, className, children, onClick }, ref) {
  const pathname = usePathname();
  const sectionId = parseSectionId(
    href.startsWith("/#") ? href.slice(1) : href
  );
  const linkHref = sectionId ? `/#${sectionId}` : href;

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    onClick?.();

    if (!sectionId) return;

    if (pathname === "/") {
      event.preventDefault();
      scrollToMarketingSection(sectionId);
      setMarketingHash(sectionId);
    }
  }

  return (
    <Link
      ref={ref}
      href={linkHref}
      className={className}
      onClick={handleClick}
      scroll={false}
    >
      {children}
    </Link>
  );
});
