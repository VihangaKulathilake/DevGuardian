import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "w-full px-4 py-2 bg-secondary border rounded-xl text-foreground text-sm transition-colors duration-200 placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none",
            error ? "border-destructive focus:border-destructive focus:ring-destructive/50" : "border-border",
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-destructive font-medium mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
export default Input;
