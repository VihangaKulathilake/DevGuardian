"use client";

import * as React from "react";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/navbar/Sidebar";
import DashboardCards from "@/components/dashboard/DashboardCards";
import RepositoryList from "@/components/dashboard/RepositoryList";
import IssueCard from "@/components/dashboard/IssueCard";
import ChartContainer from "@/components/dashboard/ChartContainer";
import { GitPullRequest, ShieldCheck, ShieldAlert, CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";

export default function DashboardPage() {
  const recentActivities = [
    {
      action: "Vulnerability Resolved",
      repo: "payment-gateway",
      details: "Fixed SQL injection vulnerability in database connection logic.",
      time: "24m ago",
      icon: CheckCircle2,
      iconColor: "text-emerald-400",
    },
    {
      action: "Vulnerability Found",
      repo: "auth-service",
      details: "High severity key leakage detected inside config/app.json",
      time: "2 hours ago",
      icon: ShieldAlert,
      iconColor: "text-destructive",
    },
    {
      action: "Scan Completed",
      repo: "devguardian-frontend",
      details: "Completed full static code analysis on branch 'main'. Zero critical issues.",
      time: "4 hours ago",
      icon: ShieldCheck,
      iconColor: "text-primary",
    },
    {
      action: "New PR Created",
      repo: "auth-service",
      details: "AI Pull Request #42 created to resolve dependencies vulnerabilities.",
      time: "1 day ago",
      icon: GitPullRequest,
      iconColor: "text-purple-400",
    },
  ];

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
              <div className="flex flex-col gap-4">
                <IssueCard
                  title="SQL Injection Vulnerability"
                  description="User input is directly concatenated into a raw SQL query. Use parameterized queries or ORM instead."
                  severity="critical"
                  filePath="src/services/db.ts"
                  lineNo={42}
                  category="security"
                  codeSnippet={`const query = "SELECT * FROM users WHERE id = " + input;`}
                />
                <IssueCard
                  title="Hardcoded API Secret Key"
                  description="A secret key was found committed in source code. Move sensitive values to environment variables."
                  severity="high"
                  filePath="config/app.json"
                  lineNo={12}
                  category="security"
                  codeSnippet={`"api_secret": "sk_live_51Nz8..."`}
                />
              </div>
            </div>
          </div>

          {/* Activity and Charts Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
              <ChartContainer title="Vulnerabilities Over Time" subtitle="Weekly scan trends">
                <div className="text-sm text-muted-foreground italic flex flex-col items-center gap-2">
                  {/* Visual Chart Placeholder */}
                  <div className="flex gap-3 items-end h-28 mb-2">
                    <div className="w-8 bg-primary/30 h-10 rounded-lg" />
                    <div className="w-8 bg-primary/50 h-16 rounded-lg" />
                    <div className="w-8 bg-primary/70 h-12 rounded-lg" />
                    <div className="w-8 bg-primary h-24 rounded-lg" />
                    <div className="w-8 bg-primary/45 h-8 rounded-lg" />
                  </div>
                  <span>Chart data visualization powered by Recharts</span>
                </div>
              </ChartContainer>
              <ChartContainer title="Code Issues by Type" subtitle="Security vs Quality distribution">
                <div className="text-sm text-muted-foreground italic flex flex-col items-center gap-2">
                  {/* Visual Pie Placeholder */}
                  <div className="relative h-28 w-28 rounded-full border-[10px] border-primary/20 border-t-primary border-l-amber-500 mb-2 flex items-center justify-center">
                    <span className="text-[10px] font-bold not-italic text-white">75% SEC</span>
                  </div>
                  <span>Chart data visualization powered by Recharts</span>
                </div>
              </ChartContainer>
            </div>

            {/* Recent Activity Panel */}
            <Card title="Recent Activity" subtitle="Action log across linked repos">
              <div className="flex flex-col gap-5">
                {recentActivities.map((act, index) => {
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
                })}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
