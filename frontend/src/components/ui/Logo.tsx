import Link from "next/link";
import { PLATFORM_MARK, PLATFORM_NAME, PLATFORM_WORD } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  size = "md",
  className,
}: {
  href?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: { text: "text-[15px]" },
    md: { text: "text-[17px]" },
    lg: { text: "text-xl" },
  };

  const s = sizes[size];

  return (
    <Link
      href={href}
      className={cn("flex items-center group shrink-0", className)}
      aria-label={`${PLATFORM_NAME} home`}
    >
      <span className={cn("font-semibold tracking-tight leading-none", s.text)}>
        <span className="text-[var(--text)]">{PLATFORM_WORD}</span>
        <span className="text-[var(--primary)]">{PLATFORM_MARK}</span>
      </span>
    </Link>
  );
}
