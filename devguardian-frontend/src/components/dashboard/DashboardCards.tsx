import * as React from "react";
import { useEffect, useState } from "react";
import StatCard from "./StatCard";
import { Shield, Bug, AlertTriangle, ShieldCheck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchRepositories } from "@/features/repository/repositorySlice";
import { analysisApi } from "@/features/analysis/analysisApi";

export const DashboardCards: React.FC = () => {
  const dispatch = useAppDispatch();
  const { repositories } = useAppSelector((state) => state.repo);
  const [stats, setStats] = useState({
    securityScore: "N/A",
    vulnerabilities: 0,
    codeSmells: 0,
    criticalAlerts: 0,
    loading: false,
  });

  useEffect(() => {
    dispatch(fetchRepositories());
  }, [dispatch]);

  useEffect(() => {
    if (repositories.length === 0) {
      if (stats.securityScore !== "N/A" || stats.vulnerabilities !== 0 || stats.loading) {
        setStats({
          securityScore: "N/A",
          vulnerabilities: 0,
          codeSmells: 0,
          criticalAlerts: 0,
          loading: false,
        });
      }
      return;
    }

    const loadAggregatedStats = async () => {
      setStats(prev => ({ ...prev, loading: true }));
      try {
        const allAnalysesPromises = repositories.map(repo =>
          analysisApi.getRepositoryAnalyses(repo.id)
        );
        const allAnalysesResults = await Promise.all(allAnalysesPromises);

        let totalSecurityScore = 0;
        let completedScansCount = 0;
        let totalVulnerabilities = 0;
        let totalCodeSmells = 0;
        let totalCriticalAlerts = 0;

        const latestCompletedAnalyses = allAnalysesResults
          .map(history => history[0])
          .filter(analysis => analysis && analysis.status === "COMPLETED");

        if (latestCompletedAnalyses.length > 0) {
          const allIssuesPromises = latestCompletedAnalyses.map(analysis =>
            analysisApi.getAnalysisIssues(analysis.id)
          );
          const allIssuesResults = await Promise.all(allIssuesPromises);

          latestCompletedAnalyses.forEach((analysis, index) => {
            totalSecurityScore += analysis.securityScore || 0;
            completedScansCount++;

            const issues = allIssuesResults[index];
            totalVulnerabilities += issues.filter(i => i.category.toUpperCase() === "SECURITY").length;
            totalCodeSmells += issues.filter(i => i.category.toUpperCase() === "CODE_QUALITY").length;
            totalCriticalAlerts += issues.filter(i => i.severity.toUpperCase() === "CRITICAL").length;
          });
        }

        const avgScore = completedScansCount > 0 ? Math.round(totalSecurityScore / completedScansCount) : 0;
        let scoreGrade = "N/A";
        if (completedScansCount > 0) {
          if (avgScore >= 90) scoreGrade = "A";
          else if (avgScore >= 80) scoreGrade = "B";
          else if (avgScore >= 70) scoreGrade = "C";
          else if (avgScore >= 60) scoreGrade = "D";
          else scoreGrade = "F";
        }

        setStats({
          securityScore: scoreGrade === "N/A" ? "N/A" : `${scoreGrade} (${avgScore}%)`,
          vulnerabilities: totalVulnerabilities,
          codeSmells: totalCodeSmells,
          criticalAlerts: totalCriticalAlerts,
          loading: false,
        });
      } catch (err) {
        console.error("Failed to load aggregated dashboard stats:", err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    loadAggregatedStats();
  }, [repositories]);

  if (stats.loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 border border-border/50 bg-[#0d0d12]/40 animate-pulse p-6 flex flex-col justify-between cyber-card-clip">
            <div className="h-3.5 w-20 bg-zinc-800 rounded" />
            <div className="h-6 w-16 bg-zinc-800 rounded mt-4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Security Score"
        value={stats.securityScore}
        change={stats.securityScore !== "N/A" ? "Live" : undefined}
        changeType={stats.securityScore !== "N/A" ? "increase" : "neutral"}
        icon={<ShieldCheck className="h-4.5 w-4.5 text-[#00ff66]" />}
      />
      <StatCard
        title="Vulnerabilities"
        value={String(stats.vulnerabilities)}
        change="Security"
        changeType="neutral"
        icon={<Shield className="h-4.5 w-4.5 text-[#ff0055]" />}
      />
      <StatCard
        title="Code Smells"
        value={String(stats.codeSmells)}
        change="Smells"
        changeType="neutral"
        icon={<Bug className="h-4.5 w-4.5 text-[#fffb00]" />}
      />
      <StatCard
        title="Critical Alerts"
        value={String(stats.criticalAlerts)}
        change={stats.criticalAlerts > 0 ? "Action required" : "All clean"}
        changeType={stats.criticalAlerts > 0 ? "decrease" : "increase"}
        icon={<AlertTriangle className="h-4.5 w-4.5 text-cyber-pink" />}
      />
    </div>
  );
};

export default DashboardCards;

