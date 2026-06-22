"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/navbar/Sidebar";
import DashboardCards from "@/components/dashboard/DashboardCards";
import RepositoryList from "@/components/dashboard/RepositoryList";
import IssueCard from "@/components/dashboard/IssueCard";
import ChartContainer from "@/components/dashboard/ChartContainer";
import { GitPullRequest, ShieldCheck, ShieldAlert, CheckCircle2, Clock, CheckCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchRepositories } from "@/features/repository/repositorySlice";
import { analysisApi } from "@/features/analysis/analysisApi";
import { IssueResponse } from "@/features/analysis/analysisTypes";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { repositories } = useAppSelector((state) => state.repo);

  const [isMounted, setIsMounted] = useState(false);
  const [allIssues, setAllIssues] = useState<IssueResponse[]>([]);
  const [activities, setActivities] = useState<Array<{
    action: string;
    repo: string;
    details: string;
    time: string;
    icon: any;
    iconColor: string;
  }>>([]);
  const [chartData, setChartData] = useState<Array<{ date: string; count: number }>>([]);
  const [pieData, setPieData] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    dispatch(fetchRepositories());
  }, [dispatch]);

  useEffect(() => {
    if (repositories.length === 0) return;

    const loadDashboardStats = async () => {
      setLoadingData(true);
      try {
        const allAnalysesPromises = repositories.map(repo =>
          analysisApi.getRepositoryAnalyses(repo.id)
        );
        const allAnalysesResults = await Promise.all(allAnalysesPromises);

        const activityLog: typeof activities = [];
        const flatAnalyses: Array<any & { repoName: string }> = [];

        allAnalysesResults.forEach((history, idx) => {
          const repo = repositories[idx];
          history.forEach(scan => {
            flatAnalyses.push({ ...scan, repoName: repo.name });
            
            let icon = ShieldCheck;
            let iconColor = "text-primary";
            let action = "Scan Triggered";
            let details = `Analysis scan started on branch '${repo.branch || 'main'}'.`;

            if (scan.status === "COMPLETED") {
              icon = ShieldCheck;
              iconColor = "text-emerald-400";
              action = "Scan Completed";
              details = `Completed scan with score ${scan.securityScore}/100 and ${scan.totalIssues || 0} issues.`;
            } else if (scan.status === "FAILED") {
              icon = ShieldAlert;
              iconColor = "text-destructive";
              action = "Scan Failed";
              details = "Vulnerability scanning engine encountered errors.";
            }

            activityLog.push({
              action,
              repo: repo.name,
              details,
              time: new Date(scan.startedAt).toLocaleDateString(),
              icon,
              iconColor
            });
          });
        });

        // Get latest issues across all latest scans
        const latestCompletedAnalyses = allAnalysesResults
          .map(history => history[0])
          .filter(analysis => analysis && analysis.status === "COMPLETED");

        let flatIssues: IssueResponse[] = [];
        if (latestCompletedAnalyses.length > 0) {
          const allIssuesPromises = latestCompletedAnalyses.map(analysis =>
            analysisApi.getAnalysisIssues(analysis.id)
          );
          const allIssuesResults = await Promise.all(allIssuesPromises);
          allIssuesResults.forEach(issues => {
            flatIssues = [...flatIssues, ...issues];
          });
        }

        setAllIssues(flatIssues);

        // Format Area Chart Data (vulnerabilities over time)
        const issuesByDate: Record<string, number> = {};
        flatAnalyses
          .filter(scan => scan.status === "COMPLETED")
          .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())
          .forEach(scan => {
            const dateStr = new Date(scan.startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            issuesByDate[dateStr] = (issuesByDate[dateStr] || 0) + (scan.totalIssues || 0);
          });
        
        const chartFormatted = Object.entries(issuesByDate).map(([date, count]) => ({
          date,
          count
        }));
        
        setChartData(chartFormatted.length > 0 ? chartFormatted : [{ date: "No data", count: 0 }]);

        // Format Pie Chart Data
        const securityCount = flatIssues.filter(i => i.category.toUpperCase() === "SECURITY").length;
        const qualityCount = flatIssues.filter(i => i.category.toUpperCase() === "CODE_QUALITY").length;
        
        setPieData([
          { name: "Security", value: securityCount || 1, color: "#6366f1" },
          { name: "Code Quality", value: qualityCount || 1, color: "#f59e0b" }
        ]);

        setActivities(activityLog.slice(0, 5));
      } catch (err) {
        console.error("Failed to load dashboard detailed data:", err);
      } finally {
        setLoadingData(false);
      }
    };

    loadDashboardStats();
  }, [repositories]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar currentPath="/dashboard" />
        <main className="flex-1 p-6 md:p-8 bg-background overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
              Security Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitor vulnerabilities, code quality issues, and analysis metrics.
            </p>
          </div>

          {/* Stats Overview */}
          <section className="mb-8">
            <DashboardCards />
          </section>

          {/* Repos & Critical Issues Section */}
          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <h3 className="text-base font-bold text-foreground">Active Repositories</h3>
              <RepositoryList />
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-base font-bold text-foreground">Recent Security Issues</h3>
              <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
                {allIssues.length === 0 ? (
                  <div className="p-6 rounded-2xl border border-dashed border-border bg-card/10 text-center flex flex-col items-center justify-center gap-2 h-44">
                    <CheckCircle className="h-8 w-8 text-emerald-400" />
                    <p className="text-sm font-semibold text-white">No Issues Found</p>
                    <p className="text-xs text-muted-foreground">All codebases are currently clean!</p>
                  </div>
                ) : (
                  allIssues.slice(0, 4).map((issue) => (
                    <IssueCard
                      key={issue.id}
                      title={issue.title}
                      description={issue.description}
                      severity={issue.severity.toLowerCase() as any}
                      filePath={issue.filePath}
                      lineNo={issue.lineNumber}
                      category={issue.category.toLowerCase() as any}
                      codeSnippet={`Rule Code: ${issue.ruleCode}`}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Activity and Charts Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
              <ChartContainer title="Vulnerabilities Over Time" subtitle="Vulnerability trend history">
                {isMounted && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} />
                      <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "12px", color: "#fafafa", fontSize: "12px" }}
                        labelClassName="font-semibold text-white"
                      />
                      <Area type="monotone" dataKey="count" name="Issues" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-sm text-muted-foreground animate-pulse">Loading chart...</div>
                )}
              </ChartContainer>

              <ChartContainer title="Code Issues by Type" subtitle="Security vs Quality distribution">
                {isMounted && pieData.length > 0 ? (
                  <div className="flex flex-col items-center justify-center w-full">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "12px", color: "#fafafa", fontSize: "12px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex gap-4 text-xs mt-2 justify-center">
                      {pieData.map((d, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                          <span className="text-muted-foreground">{d.name}: <strong className="text-white">{d.value === 1 && allIssues.length === 0 ? 0 : d.value}</strong></span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground animate-pulse">Loading distribution...</div>
                )}
              </ChartContainer>
            </div>

            {/* Recent Activity Panel */}
            <Card title="Recent Activity" subtitle="Action log across linked repos">
              <div className="flex flex-col gap-5 max-h-[350px] overflow-y-auto pr-1">
                {activities.length === 0 ? (
                  <div className="text-center py-10 text-xs text-muted-foreground italic">
                    No activity registered yet.
                  </div>
                ) : (
                  activities.map((act, index) => {
                    const Icon = act.icon;
                    return (
                      <div key={index} className="flex gap-4">
                        <div className={`mt-0.5 rounded-lg p-1.5 bg-secondary flex items-center justify-center shrink-0 ${act.iconColor}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="text-xs font-semibold text-white truncate">{act.action}</span>
                            <span className="text-[10px] text-muted-foreground shrink-0">{act.time}</span>
                          </div>
                          <span className="text-[10px] font-medium text-primary mb-1">{act.repo}</span>
                          <p className="text-xs text-muted-foreground leading-relaxed truncate">{act.details}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
