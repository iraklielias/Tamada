import React from "react";
import { cn } from "@/lib/utils";

interface GrapevineDecorProps {
  className?: string;
}

const GrapevineDecor: React.FC<GrapevineDecorProps> = ({ className }) => (
  <div className={cn("w-full flex items-center justify-center py-4", className)}>
    <svg
      width="240"
      height="12"
      viewBox="0 0 240 12"
      fill="none"
      className="text-wine-muted"
    >
      <path
        d="M0 6H90"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.4"
      />
      <path
        d="M150 6H240"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.4"
      />
      {/* Tiny grape cluster in center */}
      <circle cx="116" cy="4" r="2" fill="currentColor" opacity="0.3" />
      <circle cx="124" cy="4" r="2" fill="currentColor" opacity="0.3" />
      <circle cx="120" cy="8" r="2" fill="currentColor" opacity="0.3" />
      {/* Vine curls */}
      <path
        d="M108 6Q112 2 116 4"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.3"
        fill="none"
      />
      <path
        d="M132 6Q128 2 124 4"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.3"
        fill="none"
      />
    </svg>
  </div>
);

export default GrapevineDecor;
