import * as React from "react";
import StatCard from "./StatCard";
import { Shield, Bug, AlertTriangle, ShieldCheck } from "lucide-react";

export interface DashboardStats {
  avgScore: number;
  scoreGrade: string;
  vulnerabilities: number;
  codeSmells: number;
  criticalAlerts: number;
  hasData: boolean;
}

export interface DashboardCardsProps {
  stats?: DashboardStats;
  loading?: boolean;
  repoCount?: number;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({
  stats = {
    avgScore: 0,
    scoreGrade: "N/A",
    vulnerabilities: 0,
    codeSmells: 0,
    criticalAlerts: 0,
    hasData: false,
  },
  loading = false,
  repoCount = 0,
}) => {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-36 border border-border/50 bg-[#0d0d12]/40 animate-pulse p-6 flex flex-col justify-between cyber-card-clip"
          >
            <div className="h-3 w-24 bg-zinc-800 rounded" />
            <div className="h-10 w-20 bg-zinc-800 rounded mt-4" />
            <div className="h-[3px] w-full bg-zinc-800 rounded mt-4" />
          </div>
        ))}
      </div>
    );
  }

  const scoreGradeColor =
    stats.hasData && stats.avgScore >= 80
      ? "increase"
      : stats.hasData && stats.avgScore < 60
      ? "decrease"
      : "neutral";

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Security Score */}
      <StatCard
        title="Security Score"
        value={stats.hasData ? `${stats.avgScore}%` : "N/A"}
        change={stats.hasData ? `Grade ${stats.scoreGrade}` : undefined}
        changeType={scoreGradeColor}
        subtitle={
          stats.hasData
            ? `Avg across ${repoCount} repo${repoCount !== 1 ? "s" : ""}`
            : "No scans completed yet"
        }
        fillPercent={stats.hasData ? stats.avgScore : undefined}
        icon={<ShieldCheck className="h-4.5 w-4.5 text-[#00ff66]" />}
      />

      {/* Vulnerabilities */}
      <StatCard
        title="Vulnerabilities"
        value={stats.vulnerabilities}
        change={stats.vulnerabilities > 0 ? "Review needed" : "None found"}
        changeType={stats.vulnerabilities > 0 ? "decrease" : "increase"}
        subtitle="Security category issues"
        fillPercent={
          stats.hasData
            ? Math.min(
                100,
                (stats.vulnerabilities /
                  Math.max(1, stats.vulnerabilities + stats.codeSmells)) *
                  100
              )
            : undefined
        }
        icon={<Shield className="h-4.5 w-4.5 text-[#ff0055]" />}
      />

      {/* Code Quality Issues */}
      <StatCard
        title="Code Quality"
        value={stats.codeSmells}
        change={stats.codeSmells > 0 ? "Needs attention" : "All good"}
        changeType={stats.codeSmells > 0 ? "neutral" : "increase"}
        subtitle="Code smells & maintainability"
        icon={<Bug className="h-4.5 w-4.5 text-[#fffb00]" />}
      />

      {/* Critical Alerts */}
      <StatCard
        title="Critical Alerts"
        value={stats.criticalAlerts}
        change={stats.criticalAlerts > 0 ? "Action required" : "All clear"}
        changeType={stats.criticalAlerts > 0 ? "decrease" : "increase"}
        subtitle={
          stats.criticalAlerts > 0
            ? `${stats.criticalAlerts} issue${
                stats.criticalAlerts !== 1 ? "s" : ""
              } need immediate fix`
            : "No critical issues detected"
        }
        icon={<AlertTriangle className="h-4.5 w-4.5 text-cyber-pink" />}
      />
    </div>
  );
};

export default DashboardCards;
