import { ExternalLink, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { isTronScanUrl } from "@/lib/tronscan";

export function TronScanLink({
  url,
  label = "View",
  className,
  compact = false,
}: {
  url?: string | null;
  label?: string;
  className?: string;
  compact?: boolean;
}) {
  if (!url || !isTronScanUrl(url)) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(compact ? "tron-view-btn" : "tron-link", className)}
    >
      <ShieldCheck size={compact ? 13 : 16} />
      {label}
      <ExternalLink size={compact ? 11 : 14} />
    </a>
  );
}
