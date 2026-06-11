import { cn } from "@/lib/utils";
import { BRAND_ICON, BRAND_NAME } from "@/lib/brand";

export function VivaAiIcon({
  size = 16,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("chat-avatar", className)}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={BRAND_ICON}
        alt={BRAND_NAME}
        width={size}
        height={size}
        className="chat-avatar-img"
        draggable={false}
      />
    </span>
  );
}
