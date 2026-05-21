"use client";

import * as React from "react";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/navbar/Sidebar";
import DashboardCards from "@/components/dashboard/DashboardCards";
import RepositoryList from "@/components/dashboard/RepositoryList";
import IssueCard from "@/components/dashboard/IssueCard";
import ChartContainer from "@/components/dashboard/ChartContainer";

export default function Home() {
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
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground">Active Repositories</h3>
              </div>
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

          {/* Chart Wrapper Container */}
          <section className="grid gap-6 md:grid-cols-2">
            <ChartContainer title="Vulnerabilities Over Time" subtitle="Weekly scan trends">
              <div className="text-sm text-muted-foreground italic flex flex-col items-center gap-2">
                {/* Visual Chart Placeholder */}
                <div className="flex gap-2 items-end h-24 mb-2">
                  <div className="w-6 bg-primary/40 h-10 rounded-sm" />
                  <div className="w-6 bg-primary/60 h-16 rounded-sm" />
                  <div className="w-6 bg-primary/80 h-12 rounded-sm" />
                  <div className="w-6 bg-primary h-20 rounded-sm" />
                  <div className="w-6 bg-primary/50 h-8 rounded-sm" />
                </div>
                <span>Chart data visualization powered by Recharts (Wrapper Component)</span>
              </div>
            </ChartContainer>
            <ChartContainer title="Code Issues by Type" subtitle="Security vs Quality distribution">
              <div className="text-sm text-muted-foreground italic flex flex-col items-center gap-2">
                {/* Visual Pie Placeholder */}
                <div className="relative h-24 w-24 rounded-full border-8 border-primary/20 border-t-primary border-l-amber-500 mb-2 flex items-center justify-center">
                  <span className="text-[10px] font-bold not-italic">75% SEC</span>
                </div>
                <span>Chart data visualization powered by Recharts (Wrapper Component)</span>
              </div>
            </ChartContainer>
          </section>
        </main>
      </div>
    </div>
  );
}
