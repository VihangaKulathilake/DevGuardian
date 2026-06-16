"use client";

import * as React from "react";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/navbar/Sidebar";
import IssueCard from "@/components/dashboard/IssueCard";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Play, Sparkles, GitPullRequest } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchRepositoryById } from "@/store/repoSlice";
import {
  triggerAnalysis,
  fetchRepositoryAnalyses,
  fetchAnalysisIssues,
} from "@/store/analysisSlice";

function AnalysisPageContent() {
  const searchParams = useSearchParams();
  const repoIdParam = searchParams.get("repoId");
  const analysisIdParam = searchParams.get("analysisId");

  const dispatch = useAppDispatch();

  const repoId = repoIdParam ? parseInt(repoIdParam, 10) : null;
  const analysisId = analysisIdParam ? parseInt(analysisIdParam, 10) : null;

  const { currentRepository } = useAppSelector((state) => state.repo);
  const { analyses, issues, currentAnalysis, loading } = useAppSelector(
    (state) => state.analysis
  );

  const [localScanning, setLocalScanning] = useState(false);

  // 1. Fetch Repository Details & Scan History
  useEffect(() => {
    if (repoId) {
      dispatch(fetchRepositoryById(repoId));
      dispatch(fetchRepositoryAnalyses(repoId));
    }
  }, [repoId, dispatch]);

  // 2. Determine active analysis run and fetch its detected issues
  const activeAnalysis = currentAnalysis || (analyses.length > 0 ? analyses[0] : null);
  const activeAnalysisId = analysisId || activeAnalysis?.id;

  useEffect(() => {
    if (activeAnalysisId) {
      dispatch(fetchAnalysisIssues(activeAnalysisId));
    }
  }, [activeAnalysisId, dispatch]);

  const runScan = async () => {
    if (!repoId) return;
    setLocalScanning(true);
    try {
      const resultAction = await dispatch(triggerAnalysis(repoId));
      if (triggerAnalysis.fulfilled.match(resultAction)) {
        const newAnalysis = resultAction.payload;
        dispatch(fetchAnalysisIssues(newAnalysis.id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLocalScanning(false);
    }
  };

  const isScanning = loading || localScanning;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar currentPath="/analysis" />
        <main className="flex-1 p-6 md:p-8 bg-background overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Security Analysis
                </h1>
                {currentRepository && (
                  <Badge variant="neutral">{currentRepository.name}</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Run security audit scans and manage auto-detected vulnerabilities.
              </p>
            </div>
            {repoId && (
              <Button
                onClick={runScan}
                loading={isScanning}
                className="sm:w-auto shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5"
              >
                <Play className="h-4 w-4" fill="currentColor" />
                Trigger Full Scan
              </Button>
            )}
          </div>

          {/* AI Summary Section */}
          {activeAnalysis && (
            <section className="mb-8">
              <Card className="border-primary/20 bg-primary/5 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-white mb-2">DevGuardian Security Summary</h3>
                    <div className="text-xs text-muted-foreground leading-relaxed space-y-3">
                      <p>
                        DevGuardian analyzed <strong className="text-white">{currentRepository?.name || "repository"}</strong>. Here are the findings and score metrics:
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground/90">
                        <li>Security Score: <strong className="text-emerald-400">{activeAnalysis.securityScore}/100</strong></li>
                        <li>Code Quality Score: <strong className="text-amber-400">{activeAnalysis.qualityScore}/100</strong></li>
                        <li>Architecture Design Score: <strong className="text-indigo-400">{activeAnalysis.architectureScore}/100</strong></li>
                        <li>Detected <strong className="text-white">{issues.length} Vulnerabilities</strong> in this scan run.</li>
                      </ul>
                      <div className="pt-2 flex items-center gap-2">
                        <Button variant="secondary" size="sm" className="h-8 gap-1.5">
                          <GitPullRequest className="h-3.5 w-3.5" />
                          Apply Remediations
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </section>
          )}

          {/* Issues List Grid */}
          <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-white">Vulnerabilities & Issues ({issues.length})</h3>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-destructive" /> Critical</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Warning</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Info</span>
              </div>
            </div>
            
            {issues.length === 0 ? (
              <div className="text-center py-16 text-sm text-muted-foreground border border-dashed border-border rounded-2xl bg-card/10">
                {isScanning ? "Scanning codebase..." : "No vulnerabilities or issues identified in this scan run."}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {issues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    title={issue.title}
                    description={issue.description + "\n\nRecommendation: " + issue.recommendation}
                    severity={issue.severity.toLowerCase() as any}
                    filePath={issue.filePath}
                    lineNo={issue.lineNumber}
                    category={issue.category.toLowerCase() as any}
                    codeSnippet={`Rule Code: ${issue.ruleCode}`}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted-foreground">Loading Analysis Screen...</div>}>
      <AnalysisPageContent />
    </Suspense>
  );
}
