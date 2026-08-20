"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/navbar/Sidebar";
import DashboardCards from "@/components/dashboard/DashboardCards";
import RepositoryList from "@/components/dashboard/RepositoryList";
import IssueCard from "@/components/dashboard/IssueCard";
import ChartContainer from "@/components/dashboard/ChartContainer";
import { GitPullRequest, ShieldCheck, ShieldAlert, CheckCircle, Clock } from "lucide-react";
import Card from "@/components/ui/Card";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchRepositories } from "@/features/repository/repositorySlice";
import { analysisApi } from "@/features/analysis/analysisApi";
import { IssueResponse } from "@/features/analysis/analysisTypes";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import AppFooter from "@/components/common/AppFooter";

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
            let iconColor = "text-cyber-cyan";
            let action = "Scan Triggered";
            let details = `Analysis scan started on branch '${repo.branch || 'main'}'.`;

            if (scan.status === "COMPLETED") {
              icon = ShieldCheck;
              iconColor = "text-cyber-green";
              action = "Scan Completed";
              details = `Completed scan with score ${scan.securityScore}/100 and ${scan.totalIssues || 0} issues.`;
            } else if (scan.status === "FAILED") {
              icon = ShieldAlert;
              iconColor = "text-cyber-pink";
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

        // Format Pie Chart Data with Cyber Colors
        const securityCount = flatIssues.filter(i => i.category.toUpperCase() === "SECURITY").length;
        const qualityCount = flatIssues.filter(i => i.category.toUpperCase() === "CODE_QUALITY").length;
        
        setPieData([
          { name: "Security Issues", value: securityCount || 1, color: "#00f0ff" },
          { name: "Code Quality", value: qualityCount || 1, color: "#ff007f" }
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
    <div className="flex flex-col min-h-screen bg-[#030306] cyber-grid-bg text-foreground">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar currentPath="/dashboard" />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-[1600px] mx-auto space-y-8">
          
          {/* Header */}
          <div className="border-b border-cyber-cyan/15 pb-6 select-none text-left">
            <h1 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-white uppercase tracking-wider mb-2 leading-none">
              SECURITY TELEMETRY CENTRAL
            </h1>
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
              Real-time code threat analysis, metric history, and codebase health status.
            </p>
          </div>

          {/* Stats Overview Grid */}
          <section>
            <DashboardCards />
          </section>

          {/* Repos & Critical Issues Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <h3 className="text-xs font-orbitron font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 select-none text-left">
                <ShieldCheck className="h-4.5 w-4.5 text-cyber-cyan shrink-0" />
                Active Repositories Under Audit
              </h3>
              <RepositoryList />
            </div>

            <div className="flex flex-col gap-4 text-left">
              <h3 className="text-xs font-orbitron font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
                <ShieldAlert className="h-4.5 w-4.5 text-cyber-pink shrink-0" />
                Recent Security Alerts
              </h3>
              
              <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                {allIssues.length === 0 ? (
                  <div className="p-6 border border-dashed border-border bg-[#0b0b14]/40 text-center flex flex-col items-center justify-center gap-2.5 h-44 cyber-card-clip">
                    <CheckCircle className="h-8 w-8 text-cyber-green animate-pulse" />
                    <p className="text-xs font-orbitron font-bold text-white uppercase tracking-wider">No Issues Found</p>
                    <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">All codebases are currently clean!</p>
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
              
              {/* Chart 1: Area Chart */}
              <ChartContainer 
                title="Vulnerabilities Over Time" 
                subtitle="Historical threat metrics log"
                className="border-cyber-cyan/15 text-left"
              >
                {isMounted && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        stroke="#4b5563" 
                        fontSize={9} 
                        tickLine={false} 
                        style={{ fontFamily: 'var(--font-share-tech-mono)', textTransform: 'uppercase' }}
                      />
                      <YAxis 
                        stroke="#4b5563" 
                        fontSize={9} 
                        tickLine={false}
                        style={{ fontFamily: 'var(--font-share-tech-mono)' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "#07070b", 
                          borderColor: "#00f0ff25", 
                          borderRadius: "0px", 
                          color: "#fafafa", 
                          fontSize: "11px",
                          fontFamily: "var(--font-share-tech-mono)"
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
                  <div className="text-xs font-mono text-zinc-500 animate-pulse">Loading telemetry chart...</div>
                )}
              </ChartContainer>

              {/* Chart 2: Pie Chart */}
              <ChartContainer 
                title="Code Issues Distribution" 
                subtitle="Security vs quality ratio"
                className="border-cyber-cyan/15 text-left"
              >
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
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
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
                            fontFamily: "var(--font-share-tech-mono)"
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex gap-5 text-[10px] font-mono mt-3 justify-center">
                      {pieData.map((d, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-none animate-pulse" style={{ backgroundColor: d.color }} />
                          <span className="text-zinc-400 uppercase">
                            {d.name}: <strong className="text-white">{d.value === 1 && allIssues.length === 0 ? 0 : d.value}</strong>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs font-mono text-zinc-500 animate-pulse">Loading distribution details...</div>
                )}
              </ChartContainer>
            </div>

            {/* Recent Activity Panel */}
            <Card 
              title="Audit Activity Logs" 
              subtitle="Scan transactions across workspace repositories"
              className="border-cyber-cyan/15 text-left"
            >
              <div className="flex flex-col gap-5 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin mt-2">
                {activities.length === 0 ? (
                  <div className="text-center py-10 text-xs font-mono text-zinc-500 italic select-none">
                    // No system transactions registered.
                  </div>
                ) : (
                  activities.map((act, index) => {
                    const Icon = act.icon;
                    return (
                      <div key={index} className="flex gap-4 items-start">
                        {/* Glowing Log Icon Indicator */}
                        <div className={`mt-0.5 border border-zinc-800/80 bg-[#07070c] rounded-none p-1.5 flex items-center justify-center shrink-0 ${act.iconColor}`}>
                          <Icon className="h-4 w-4 shrink-0" />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0 font-sans">
                          <div className="flex items-center justify-between gap-2 mb-0.5 font-mono">
                            <span className="text-xs font-bold text-white uppercase tracking-wide truncate">{act.action}</span>
                            <span className="text-[9px] text-zinc-500 shrink-0">{act.time}</span>
                          </div>
                          <span className="text-[10px] font-bold font-mono text-cyber-cyan select-all tracking-wider uppercase mb-1">{act.repo}</span>
                          <p className="text-xs text-zinc-400 leading-relaxed truncate">{act.details}</p>
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
