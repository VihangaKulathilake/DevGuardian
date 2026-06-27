import * as React from "react";
import Card from "../ui/Card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  change,
  changeType = "neutral",
  className,
}) => {
  return (
    <Card className={cn("p-6 flex flex-col justify-between hover:border-cyber-cyan/45 transition-all duration-300 relative overflow-hidden", className)}>
      {/* Grid Dot backdrop */}
      <div className="absolute inset-0 cyber-grid-dot opacity-25 pointer-events-none" />
      
      {/* Corner notch accent */}
      <div className="tech-corner-accent scale-75 origin-top-left" />

      <div className="flex items-center justify-between gap-4 relative z-10">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-orbitron">
          {title}
        </span>
        {icon && <div className="text-muted-foreground flex shrink-0 items-center justify-center">{icon}</div>}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-2 relative z-10">
        <span className="text-2xl font-black text-white font-mono tracking-tight">{value}</span>
        {change && (
          <span
            className={cn("text-[9px] font-bold px-2 py-0.5 rounded-none font-mono uppercase border tracking-wider", {
              "bg-[#051e12]/80 text-[#00ff66] border-[#00ff66]/20 shadow-[0_0_8px_rgba(0,255,102,0.1)]": changeType === "increase",
              "bg-[#240a12]/80 text-[#ff0055] border-[#ff0055]/20 shadow-[0_0_8px_rgba(255,0,85,0.1)]": changeType === "decrease",
              "bg-[#11111a]/80 text-[#8a8a9e] border-border/80": changeType === "neutral",
            })}
          >
            {change}
          </span>
        )}
      </div>

      {/* Decorative neon bottom bar indicator */}
      <div 
        className={cn("h-[2.5px] w-full absolute bottom-0 left-0 transition-all duration-300", {
          "bg-[#00ff66] shadow-[0_-2px_10px_#00ff66]": title.toLowerCase().includes("score") && value !== "N/A" && !value.toString().startsWith("F"),
          "bg-[#ff0055] shadow-[0_-2px_10px_#ff0055] animate-pulse": (title.toLowerCase().includes("vulnerabilities") || title.toLowerCase().includes("critical")) && value !== "0",
          "bg-[#fffb00] shadow-[0_-2px_10px_#fffb00]": title.toLowerCase().includes("smells") && value !== "0",
          "bg-border/60": value === "0" || value === "N/A" || (title.toLowerCase().includes("score") && value.toString().startsWith("F"))
        })}
      />
    </Card>
  );
};

export default StatCard;

