import Link from "next/link";
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
      aria-label="VivadX home"
    >
      <span className={cn("font-semibold tracking-tight leading-none", s.text)}>
        <span className="text-[var(--text)]">Vivad</span>
        <span className="text-[var(--primary)]">X</span>
      </span>
    </Link>
  );
}
