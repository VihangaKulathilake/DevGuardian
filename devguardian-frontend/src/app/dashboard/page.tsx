"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/navbar/Sidebar";
import DashboardCards, { DashboardStats } from "@/components/dashboard/DashboardCards";
import RepositoryList from "@/components/dashboard/RepositoryList";
import IssueCard from "@/components/dashboard/IssueCard";
import ChartContainer from "@/components/dashboard/ChartContainer";
import { ShieldCheck, ShieldAlert, CheckCircle, ArrowRight } from "lucide-react";
import Card from "@/components/ui/Card";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchDashboardSummary } from "@/features/analysis/analysisSlice";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import AppFooter from "@/components/common/AppFooter";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { dashboardSummary, loading, error } = useAppSelector((state) => state.analysis);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    dispatch(fetchDashboardSummary());
  }, [dispatch]);

  const stats: DashboardStats = {
    avgScore: dashboardSummary?.avgSecurityScore ?? 0,
    scoreGrade: dashboardSummary?.scoreGrade ?? "N/A",
    vulnerabilities: dashboardSummary?.totalVulnerabilities ?? 0,
    codeSmells: dashboardSummary?.totalCodeSmells ?? 0,
    criticalAlerts: dashboardSummary?.totalCriticalAlerts ?? 0,
    hasData: dashboardSummary?.hasData ?? false,
  };

  // Display only the top 4 most recently active repositories on dashboard
  const allRepositories = dashboardSummary?.repositories ?? [];
  const displayedRepositories = allRepositories.slice(0, 4);

  // Display top 3-4 recent security alerts
  const recentAlerts = (dashboardSummary?.recentAlerts ?? []).slice(0, 4);
  const activities = (dashboardSummary?.recentActivities ?? []).slice(0, 5);
  const chartData = (dashboardSummary?.vulnerabilitiesOverTime && dashboardSummary.vulnerabilitiesOverTime.length > 0)
    ? dashboardSummary.vulnerabilitiesOverTime
    : [{ date: "No data", count: 0 }];

  const securityCount = dashboardSummary?.totalVulnerabilities ?? 0;
  const qualityCount = dashboardSummary?.totalCodeSmells ?? 0;
  const pieData = [
    { name: "Security Issues", value: securityCount || (qualityCount === 0 ? 0 : 0), color: "#00f0ff" },
    { name: "Code Quality", value: qualityCount || (securityCount === 0 ? 0 : 0), color: "#ff007f" },
  ];
  if (securityCount === 0 && qualityCount === 0) {
    pieData[0].value = 0;
    pieData[1].value = 0;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#030306] cyber-grid-bg text-foreground">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar currentPath="/dashboard" />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-[1600px] mx-auto space-y-8">
          {/* Header */}
          <div className="border-b border-cyber-cyan/15 pb-6 select-none text-left">
            <h1 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-white uppercase tracking-wider mb-2 leading-none">
              Security Dashboard
            </h1>
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
              Real-time code threat analysis, metric history, and codebase health status.
            </p>
          </div>

          {/* Stats Overview Grid */}
          <section>
            <DashboardCards
              stats={stats}
              loading={loading && !dashboardSummary}
              repoCount={dashboardSummary?.totalRepositories ?? 0}
            />
          </section>

          {/* Repos & Critical Issues Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex items-center justify-between select-none">
                <h3 className="text-xs font-orbitron font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 text-left">
                  <ShieldCheck className="h-4.5 w-4.5 text-cyber-cyan shrink-0" />
                  Recent Repositories Under Audit
                </h3>
                {allRepositories.length > 0 && (
                  <Link
                    href="/repositories"
                    className="text-xs font-mono text-cyber-cyan hover:text-cyber-cyan/80 flex items-center gap-1 transition-colors uppercase tracking-wider"
                  >
                    <span>View All ({dashboardSummary?.totalRepositories ?? allRepositories.length})</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
              <RepositoryList
                repositories={displayedRepositories}
                loading={loading && !dashboardSummary}
                error={error}
              />
            </div>

            <div className="flex flex-col gap-4 text-left">
              <div className="flex items-center justify-between select-none">
                <h3 className="text-xs font-orbitron font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="h-4.5 w-4.5 text-cyber-pink shrink-0" />
                  Recent Security Alerts
                </h3>
                {recentAlerts.length > 0 && (
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    Top {recentAlerts.length} Critical
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                {recentAlerts.length === 0 ? (
                  <div className="p-6 border border-dashed border-border bg-[#0b0b14]/40 text-center flex flex-col items-center justify-center gap-2.5 h-44 cyber-card-clip">
                    <CheckCircle className="h-8 w-8 text-cyber-green animate-pulse" />
                    <p className="text-xs font-orbitron font-bold text-white uppercase tracking-wider">
                      No Issues Found
                    </p>
                    <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
                      All codebases are currently clean!
                    </p>
                  </div>
                ) : (
                  recentAlerts.map((issue) => (
                    <IssueCard
                      key={issue.id}
                      title={issue.title}
                      description={issue.description}
                      severity={issue.severity.toLowerCase() as any}
                      filePath={issue.filePath}
                      lineNo={issue.lineNumber}
                      category={issue.category.toLowerCase() as any}
                      codeSnippet={issue.codeSnippet ? issue.codeSnippet : `Rule Code: ${issue.ruleCode}`}
                      repoName={issue.repositoryName}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Activity and Charts Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
              {/* Chart 1: Area Chart */}
              <ChartContainer
                title="Vulnerabilities Over Time"
                subtitle="Historical threat metrics log"
                className="border-cyber-cyan/15 text-left"
              >
                {isMounted && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        stroke="#4b5563"
                        fontSize={9}
                        tickLine={false}
                        style={{
                          fontFamily: "var(--font-share-tech-mono)",
                          textTransform: "uppercase",
                        }}
                      />
                      <YAxis
                        stroke="#4b5563"
                        fontSize={9}
                        tickLine={false}
                        style={{ fontFamily: "var(--font-share-tech-mono)" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#07070b",
                          borderColor: "#00f0ff25",
                          borderRadius: "0px",
                          color: "#fafafa",
                          fontSize: "11px",
                          fontFamily: "var(--font-share-tech-mono)",
                        }}
                        labelClassName="font-bold text-white uppercase tracking-wider"
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        name="Issues Found"
                        stroke="#00f0ff"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCount)"
                        style={{ filter: "drop-shadow(0 0 4px rgba(0, 240, 255, 0.45))" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs font-mono text-zinc-500 animate-pulse">
                    Loading chart...
                  </div>
                )}
              </ChartContainer>

              {/* Chart 2: Pie Chart */}
              <ChartContainer
                title="Code Issues Distribution"
                subtitle="Security vs quality ratio"
                className="border-cyber-cyan/15 text-left"
              >
                {isMounted ? (
                  <div className="flex flex-col items-center justify-center w-full">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={securityCount === 0 && qualityCount === 0 ? [{ name: "No Issues", value: 1, color: "#10b981" }] : pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {(securityCount === 0 && qualityCount === 0 ? [{ name: "No Issues", value: 1, color: "#10b981" }] : pieData).map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                              style={{ filter: `drop-shadow(0 0 3px ${entry.color}44)` }}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#07070b",
                            borderColor: "#00f0ff25",
                            borderRadius: "0px",
                            color: "#fafafa",
                            fontSize: "11px",
                            fontFamily: "var(--font-share-tech-mono)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex gap-5 text-[10px] font-mono mt-3 justify-center">
                      {pieData.map((d, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 rounded-none animate-pulse"
                            style={{ backgroundColor: d.color }}
                          />
                          <span className="text-zinc-400 uppercase">
                            {d.name}: <strong className="text-white">{d.value}</strong>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs font-mono text-zinc-500 animate-pulse">
                    Loading distribution details...
                  </div>
                )}
              </ChartContainer>
            </div>

            {/* Recent Activity Panel */}
            <Card
              title="Recent Activity"
              subtitle="Latest scan events across your repositories"
              className="border-cyber-cyan/15 text-left"
            >
              <div className="flex flex-col gap-5 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin mt-2">
                {activities.length === 0 ? (
                  <div className="text-center py-10 text-xs font-mono text-zinc-500 italic select-none">
                    // No system transactions registered.
                  </div>
                ) : (
                  activities.map((act, index) => {
                    let Icon = ShieldCheck;
                    let iconColor = "text-cyber-cyan";

                    if (act.status === "COMPLETED") {
                      iconColor = "text-cyber-green";
                    } else if (act.status === "FAILED") {
                      Icon = ShieldAlert;
                      iconColor = "text-cyber-pink";
                    }

                    return (
                      <div key={index} className="flex gap-4 items-start">
                        <div
                          className={`mt-0.5 border border-zinc-800/80 bg-[#07070c] rounded-none p-1.5 flex items-center justify-center shrink-0 ${iconColor}`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0 font-sans">
                          <div className="flex items-center justify-between gap-2 mb-0.5 font-mono">
                            <span className="text-xs font-bold text-white uppercase tracking-wide truncate">
                              {act.action}
                            </span>
                            <span className="text-[9px] text-zinc-500 shrink-0">
                              {act.timestamp ? new Date(act.timestamp).toLocaleDateString() : ""}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold font-mono text-cyber-cyan select-all tracking-wider uppercase mb-1">
                            {act.repoName}
                          </span>
                          <p className="text-xs text-zinc-400 leading-relaxed truncate">
                            {act.details}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          <AppFooter />
        </main>
      </div>
    </div>
  );
}
