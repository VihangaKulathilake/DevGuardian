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
          "inline-flex items-center px-3 py-0.5 text-[9px] font-bold tracking-wider font-mono uppercase transition-all duration-300 relative border shrink-0",
          "clip-path-none", // clean digital chip
          {
            // success -> Neon Green
            "bg-[#051e12]/80 text-[#00ff66] border-[#00ff66]/35 shadow-[0_0_8px_rgba(0,255,102,0.15)]": variant === "success",
            // warning -> Neon Yellow
            "bg-[#1e1705]/80 text-[#fffb00] border-[#fffb00]/35 shadow-[0_0_8px_rgba(255,251,0,0.15)]": variant === "warning",
            // error -> Neon Pink/Red
            "bg-[#240a12]/80 text-[#ff0055] border-[#ff0055]/35 shadow-[0_0_8px_rgba(255,0,85,0.15)]": variant === "error",
            // info -> Neon Cyan
            "bg-[#031d24]/80 text-[#00f0ff] border-[#00f0ff]/35 shadow-[0_0_8px_rgba(0,240,255,0.15)]": variant === "info",
            // neutral -> Dark Gray
            "bg-[#11111a]/85 text-[#8a8a9e] border-[#1a1a2e]/60": variant === "neutral",
          },
          className
        )}
        {...props}
      >
        <span className="h-1 w-1 rounded-full mr-1.5 shrink-0 animate-pulse"
          style={{
            backgroundColor: 
              variant === "success" ? "#00ff66" :
              variant === "warning" ? "#fffb00" :
              variant === "error" ? "#ff0055" :
              variant === "info" ? "#00f0ff" : "#8a8a9e"
          }}
        />
        {children}
      </span>
    );
  }
);
Badge.displayName = "Badge";
export default Badge;

