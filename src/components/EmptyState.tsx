import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
    className={cn(
      "flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-dashed border-border bg-surface-1/50",
      className
    )}
  >
    {icon && (
      <div className="mb-5 w-16 h-16 rounded-2xl bg-wine-light/60 flex items-center justify-center text-wine-muted">
        {icon}
      </div>
    )}
    <h3 className="text-heading-3 text-foreground mb-2">{title}</h3>
    {description && (
      <p className="text-body-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
    )}
    {actionLabel && onAction && (
      <Button onClick={onAction} variant="wine" className="shadow-wine">
        {actionLabel}
      </Button>
    )}
  </motion.div>
);

export default EmptyState;
