import React from "react";
import { cn } from "@/lib/utils";
import GrapevineIcon from "@/components/icons/GrapevineIcon";

interface ProBadgeProps {
  className?: string;
  size?: "sm" | "md";
}

const ProBadge: React.FC<ProBadgeProps> = ({ className, size = "sm" }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 font-semibold rounded-full gold-gradient text-gold-foreground",
      size === "sm" && "px-2 py-0.5 text-xs",
      size === "md" && "px-3 py-1 text-sm",
      className
    )}
  >
    <GrapevineIcon size={size === "sm" ? 12 : 14} />
    PRO
  </span>
);

export default ProBadge;
