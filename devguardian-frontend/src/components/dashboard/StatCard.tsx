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
    <Card className={cn("p-6 flex flex-col justify-between", className)}>
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        {change && (
          <span
            className={cn("text-xs font-medium px-2 py-0.5 rounded-full", {
              "bg-emerald-500/10 text-emerald-400": changeType === "increase",
              "bg-destructive/10 text-destructive": changeType === "decrease",
              "bg-secondary text-muted-foreground": changeType === "neutral",
            })}
          >
            {change}
          </span>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
