import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "text" | "card" | "avatar" | "button";
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ className, variant = "text" }) => {
  const base = "bg-wine-light/60 rounded-md animate-pulse-wine relative overflow-hidden";

  const variants: Record<string, string> = {
    text: "h-4 w-full",
    card: "h-32 w-full rounded-xl",
    avatar: "h-10 w-10 rounded-full",
    button: "h-10 w-28 rounded-lg",
  };

  return (
    <div className={cn(base, variants[variant], className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
    </div>
  );
};

export default LoadingSkeleton;
