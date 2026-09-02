import * as React from "react";
import Card from "../ui/Card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
  subtitle?: string;
  /** 0–100, drives the fill bar. Omit to hide the bar. */
  fillPercent?: number;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  change,
  changeType = "neutral",
  subtitle,
  fillPercent,
  className,
}) => {
  const barColor =
    changeType === "increase"
      ? "bg-[#00ff66] shadow-[0_0_8px_#00ff6688]"
      : changeType === "decrease"
      ? "bg-[#ff0055] shadow-[0_0_8px_#ff005588]"
      : "bg-zinc-600";

  return (
    <Card
      className={cn(
        "flex flex-col justify-between hover:border-cyber-cyan/45 transition-all duration-300 relative overflow-hidden p-5",
        className
      )}
    >
      {/* Dot grid background */}
      <div className="absolute inset-0 cyber-grid-dot opacity-25 pointer-events-none" />
      <div className="tech-corner-accent scale-75 origin-top-left" />

      {/* Top row: label + icon */}
      <div className="flex items-center justify-between gap-3 relative z-10 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-orbitron leading-none">
          {title}
        </span>
        {icon && (
          <div className="text-muted-foreground flex shrink-0 items-center justify-center">
            {icon}
          </div>
        )}
      </div>

      {/* Primary number — the hero element */}
      <div className="relative z-10 flex items-end justify-between gap-3 mb-1">
        <span
          className={cn(
            "font-black font-mono tracking-tight leading-none transition-all",
            // Shrink slightly for long strings (e.g. "A (87%)")
            String(value).length > 6 ? "text-3xl" : "text-4xl",
            changeType === "increase"
              ? "text-[#00ff66]"
              : changeType === "decrease"
              ? "text-[#ff0055]"
              : "text-white"
          )}
        >
          {value}
        </span>

        {/* Trend badge */}
        {change && (
          <span
            className={cn(
              "text-[10px] font-bold px-2.5 py-1 rounded-none font-mono uppercase border tracking-wider shrink-0 mb-0.5",
              {
                "bg-[#051e12]/90 text-[#00ff66] border-[#00ff66]/30 shadow-[0_0_8px_rgba(0,255,102,0.15)]":
                  changeType === "increase",
                "bg-[#240a12]/90 text-[#ff0055] border-[#ff0055]/30 shadow-[0_0_8px_rgba(255,0,85,0.15)]":
                  changeType === "decrease",
                "bg-[#11111a]/90 text-zinc-300 border-zinc-700/80":
                  changeType === "neutral",
              }
            )}
          >
            {change}
          </span>
        )}
      </div>

      {/* Subtitle / context line */}
      {subtitle && (
        <p className="relative z-10 text-xs font-mono text-zinc-400 uppercase tracking-wider mt-1.5 mb-2">
          {subtitle}
        </p>
      )}

      {/* Fill bar — only rendered when fillPercent is provided */}
      {fillPercent !== undefined && (
        <div className="relative z-10 mt-3 h-[3px] w-full bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-700", barColor)}
            style={{ width: `${Math.min(100, Math.max(0, fillPercent))}%` }}
          />
        </div>
      )}

      {/* Bottom neon accent line */}
      <div
        className={cn(
          "h-[2px] w-full absolute bottom-0 left-0 transition-all duration-300",
          {
            "bg-[#00ff66] shadow-[0_-2px_10px_#00ff66]":
              changeType === "increase",
            "bg-[#ff0055] shadow-[0_-2px_10px_#ff0055] animate-pulse":
              changeType === "decrease",
            "bg-border/40": changeType === "neutral",
          }
        )}
      />
    </Card>
  );
};

export default StatCard;
