import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  mono?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, mono = false, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase font-orbitron">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "w-full px-4 py-2.5 bg-[#0b0b14] border text-foreground text-sm transition-all duration-300 placeholder:text-muted-foreground/30 focus:outline-none disabled:opacity-50 disabled:pointer-events-none",
            "cyber-btn-clip",
            mono ? "font-mono" : "font-sans",
            error 
              ? "border-cyber-pink/60 focus:border-cyber-pink focus:shadow-[0_0_12px_rgba(255,0,85,0.25)]" 
              : "border-border focus:border-cyber-cyan/70 focus:shadow-[0_0_12px_rgba(0,240,255,0.25)]",
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-[10px] text-cyber-pink font-bold mt-1 font-mono uppercase tracking-wider">
            {error}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
export default Input;

