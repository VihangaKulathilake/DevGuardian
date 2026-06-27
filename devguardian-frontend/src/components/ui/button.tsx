import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "cyber";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-orbitron font-bold uppercase tracking-wider transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-cyber-cyan/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer relative overflow-hidden active:scale-95",
          "cyber-btn-clip border",
          {
            // Primary: Glowing cyan button
            "bg-cyber-cyan/90 hover:bg-cyber-cyan text-black border-cyber-cyan hover:shadow-[0_0_15px_rgba(0,240,255,0.6)]": variant === "primary",
            // Secondary: Dark body with neon cyber borders
            "bg-[#0d0d1a] text-cyber-cyan border-cyber-cyan/40 hover:border-cyber-cyan hover:bg-[#121226] hover:shadow-[0_0_12px_rgba(0,240,255,0.3)]": variant === "secondary",
            // Danger: Red / Magenta neon glow button
            "bg-cyber-pink/90 hover:bg-cyber-pink text-white border-cyber-pink hover:shadow-[0_0_15px_rgba(255,0,127,0.6)]": variant === "danger",
            // Cyber accent: Glowing purple/pink button
            "bg-cyber-purple/90 hover:bg-cyber-purple text-white border-cyber-purple hover:shadow-[0_0_15px_rgba(143,0,255,0.6)]": variant === "cyber",
            // Sizes
            "px-4 py-1.5 text-[10px] rounded-sm": size === "sm",
            "px-6 py-2.5 text-xs rounded-sm": size === "md",
            "px-8 py-3.5 text-sm rounded-sm": size === "lg",
          },
          className
        )}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        <span className="relative z-10 flex items-center justify-center gap-1.5">{children}</span>
      </button>
    );
  }
);
Button.displayName = "Button";
export default Button;

