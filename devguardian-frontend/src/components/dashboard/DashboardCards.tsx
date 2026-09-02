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
    avgScore: 0,
    scoreGrade: "N/A" as string,
    vulnerabilities: 0,
    codeSmells: 0,
    criticalAlerts: 0,
    loading: false,
    hasData: false,
  });

  useEffect(() => {
    dispatch(fetchRepositories());
  }, [dispatch]);

  useEffect(() => {
    if (repositories.length === 0) {
      setStats({
        avgScore: 0,
        scoreGrade: "N/A",
        vulnerabilities: 0,
        codeSmells: 0,
        criticalAlerts: 0,
        loading: false,
        hasData: false,
      });
      return;
    }

    const loadAggregatedStats = async () => {
      setStats((prev) => ({ ...prev, loading: true }));
      try {
        const allAnalysesPromises = repositories.map((repo) =>
          analysisApi.getRepositoryAnalyses(repo.id)
        );
        const allAnalysesResults = await Promise.all(allAnalysesPromises);

        let totalSecurityScore = 0;
        let completedScansCount = 0;
        let totalVulnerabilities = 0;
        let totalCodeSmells = 0;
        let totalCriticalAlerts = 0;

        const latestCompletedAnalyses = allAnalysesResults
          .map((history) => history[0])
          .filter((analysis) => analysis && analysis.status === "COMPLETED");

        if (latestCompletedAnalyses.length > 0) {
          const allIssuesPromises = latestCompletedAnalyses.map((analysis) =>
            analysisApi.getAnalysisIssues(analysis.id)
          );
          const allIssuesResults = await Promise.all(allIssuesPromises);

          latestCompletedAnalyses.forEach((analysis, index) => {
            totalSecurityScore += analysis.securityScore || 0;
            completedScansCount++;

            const issues = allIssuesResults[index];
            totalVulnerabilities += issues.filter(
              (i) => i.category.toUpperCase() === "SECURITY"
            ).length;
            totalCodeSmells += issues.filter(
              (i) => i.category.toUpperCase() === "CODE_QUALITY"
            ).length;
            totalCriticalAlerts += issues.filter(
              (i) => i.severity.toUpperCase() === "CRITICAL"
            ).length;
          });
        }

        const avgScore =
          completedScansCount > 0
            ? Math.round(totalSecurityScore / completedScansCount)
            : 0;

        let scoreGrade = "N/A";
        if (completedScansCount > 0) {
          if (avgScore >= 90) scoreGrade = "A";
          else if (avgScore >= 80) scoreGrade = "B";
          else if (avgScore >= 70) scoreGrade = "C";
          else if (avgScore >= 60) scoreGrade = "D";
          else scoreGrade = "F";
        }

        setStats({
          avgScore,
          scoreGrade,
          vulnerabilities: totalVulnerabilities,
          codeSmells: totalCodeSmells,
          criticalAlerts: totalCriticalAlerts,
          loading: false,
          hasData: completedScansCount > 0,
        });
      } catch (err) {
        console.error("Failed to load aggregated dashboard stats:", err);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    loadAggregatedStats();
  }, [repositories]);

  if (stats.loading) {
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
      {/* Security Score — show the raw % as the big number, grade as the badge */}
      <StatCard
        title="Security Score"
        value={stats.hasData ? `${stats.avgScore}%` : "N/A"}
        change={stats.hasData ? `Grade ${stats.scoreGrade}` : undefined}
        changeType={scoreGradeColor}
        subtitle={
          stats.hasData
            ? `Avg across ${repositories.length} repo${repositories.length !== 1 ? "s" : ""}`
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
            ? Math.min(100, (stats.vulnerabilities / Math.max(1, stats.vulnerabilities + stats.codeSmells)) * 100)
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
            ? `${stats.criticalAlerts} issue${stats.criticalAlerts !== 1 ? "s" : ""} need immediate fix`
            : "No critical issues detected"
        }
        icon={<AlertTriangle className="h-4.5 w-4.5 text-cyber-pink" />}
      />
    </div>
  );
};

export default DashboardCards;
