import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "error" | "info" | "neutral";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "neutral", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border tracking-wide uppercase transition-colors duration-200",
          {
            "bg-emerald-500/10 text-emerald-400 border-emerald-500/20": variant === "success",
            "bg-amber-500/10 text-amber-400 border-amber-500/20": variant === "warning",
            "bg-destructive/10 text-destructive border-destructive/20": variant === "error",
            "bg-blue-500/10 text-blue-400 border-blue-500/20": variant === "info",
            "bg-secondary text-muted-foreground border-border": variant === "neutral",
          },
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Badge.displayName = "Badge";
export default Badge;
