import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  techCorners?: boolean;
  glowOnHover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, subtitle, headerAction, footer, techCorners = true, glowOnHover = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-card/75 backdrop-blur-md border border-border shadow-xl flex flex-col transition-all duration-300 relative group/card",
          techCorners ? "cyber-card-clip" : "rounded-2xl",
          glowOnHover ? "hover:border-cyber-cyan/40 hover:shadow-[0_0_15px_rgba(0,240,255,0.15)]" : "",
          className
        )}
        {...props}
      >
        {/* Glow Line Indicator */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan/50 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
        
        {(title || subtitle || headerAction) && (
          <div className="px-6 py-5 border-b border-border/80 flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              {title && (
                <h3 className="text-sm font-bold uppercase tracking-wider text-white font-orbitron flex items-center gap-2">
                  {title}
                </h3>
              )}
              {subtitle && <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide">{subtitle}</p>}
            </div>
            {headerAction && <div className="relative z-10">{headerAction}</div>}
          </div>
        )}
        <div className="flex-1 px-6 py-5 text-sm relative z-10">{children}</div>
        {footer && (
          <div className="px-6 py-4 bg-[#090910]/40 border-t border-border/85 flex items-center justify-end relative z-10">
            {footer}
          </div>
        )}
      </div>
    );
  }
);
Card.displayName = "Card";
export default Card;

