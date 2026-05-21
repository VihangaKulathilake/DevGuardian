import * as React from "react";
import StatCard from "./StatCard";
import { Shield, Bug, AlertTriangle, ShieldCheck } from "lucide-react";

export const DashboardCards: React.FC = () => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Security Score"
        value="A+"
        change="+2.4%"
        changeType="increase"
        icon={<ShieldCheck className="h-4 w-4 text-emerald-400" />}
      />
      <StatCard
        title="Vulnerabilities"
        value="12"
        change="-4"
        changeType="increase" // Note: decrease in vulnerabilities is positive, so increase color (green)
        icon={<Shield className="h-4 w-4 text-destructive" />}
      />
      <StatCard
        title="Code Smells"
        value="45"
        change="+3"
        changeType="decrease" // Negative change
        icon={<Bug className="h-4 w-4 text-amber-500" />}
      />
      <StatCard
        title="Critical Alerts"
        value="1"
        change="0"
        changeType="neutral"
        icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
      />
    </div>
  );
};

export default DashboardCards;
