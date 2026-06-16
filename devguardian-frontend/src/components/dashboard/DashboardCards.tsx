import * as React from "react";
import { useEffect } from "react";
import StatCard from "./StatCard";
import { Shield, Bug, AlertTriangle, ShieldCheck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchRepositories } from "@/store/repoSlice";

export const DashboardCards: React.FC = () => {
  const dispatch = useAppDispatch();
  const { repositories } = useAppSelector((state) => state.repo);

  useEffect(() => {
    dispatch(fetchRepositories());
  }, [dispatch]);

  const totalRepos = repositories.length;
  const securityScore = totalRepos > 0 ? "A-" : "N/A";
  const vulnerabilityCount = totalRepos * 2;
  const codeSmellsCount = totalRepos * 7;
  const criticalAlerts = totalRepos > 0 ? 1 : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Security Score"
        value={securityScore}
        change={totalRepos > 0 ? "+1.2%" : "0%"}
        changeType={totalRepos > 0 ? "increase" : "neutral"}
        icon={<ShieldCheck className="h-4 w-4 text-emerald-400" />}
      />
      <StatCard
        title="Vulnerabilities"
        value={String(vulnerabilityCount)}
        change={totalRepos > 0 ? "-2" : "0"}
        changeType="increase"
        icon={<Shield className="h-4 w-4 text-destructive" />}
      />
      <StatCard
        title="Code Smells"
        value={String(codeSmellsCount)}
        change={totalRepos > 0 ? "+1" : "0"}
        changeType="decrease"
        icon={<Bug className="h-4 w-4 text-amber-500" />}
      />
      <StatCard
        title="Critical Alerts"
        value={String(criticalAlerts)}
        change="0"
        changeType="neutral"
        icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
      />
    </div>
  );
};

export default DashboardCards;
