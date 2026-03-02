import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}>
    {icon && (
      <div className="mb-4 text-wine-muted">{icon}</div>
    )}
    <h3 className="text-heading-3 text-foreground mb-2">{title}</h3>
    {description && (
      <p className="text-body-sm text-muted-foreground max-w-sm mb-6">{description}</p>
    )}
    {actionLabel && onAction && (
      <Button onClick={onAction}>{actionLabel}</Button>
    )}
  </div>
);

export default EmptyState;
