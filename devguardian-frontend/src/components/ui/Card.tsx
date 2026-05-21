import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, subtitle, headerAction, footer, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col",
          className
        )}
        {...props}
      >
        {(title || subtitle || headerAction) && (
          <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              {title && <h3 className="text-base font-semibold text-foreground">{title}</h3>}
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
            {headerAction && <div>{headerAction}</div>}
          </div>
        )}
        <div className="flex-1 px-6 py-5 text-sm">{children}</div>
        {footer && (
          <div className="px-6 py-4 bg-black/10 border-t border-border flex items-center justify-end">
            {footer}
          </div>
        )}
      </div>
    );
  }
);
Card.displayName = "Card";
export default Card;
