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
import { Play, Sparkles, GitPullRequest, Search, Terminal, X, ArrowRight, ShieldAlert, ShieldCheck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchRepositoryById, fetchRepositories } from "@/features/repository/repositorySlice";
import {
  triggerAnalysis,
  fetchRepositoryAnalyses,
  fetchAnalysisIssues,
} from "@/features/analysis/analysisSlice";
import { IssueResponse } from "@/features/analysis/analysisTypes";

// SVG Score Circle Component
interface ScoreCircleProps {
  score: number;
  label: string;
  colorClass: string;
  gradientId: string;
  fromColor: string;
  toColor: string;
}

const ScoreCircle: React.FC<ScoreCircleProps> = ({ score, label, colorClass, gradientId, fromColor, toColor }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3 bg-zinc-900/50 p-6 rounded-2xl border border-border/60 hover:border-primary/20 transition-all duration-200 backdrop-blur-md">
      <div className="relative h-24 w-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={fromColor} />
              <stop offset="100%" stopColor={toColor} />
            </linearGradient>
          </defs>
          <circle
            cx="48"
            cy="48"
            r={radius}
            className="stroke-zinc-800"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="absolute text-xl font-bold text-white">{score}</span>
      </div>
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
};

// Radar Console Simulator
const RadarScanner: React.FC = () => {
  const [logIndex, setLogIndex] = useState(0);
  const logs = [
    "Initializing scan workspace for branch 'main'...",
    "Cloning repository using secure token connection...",
    "Repository cloned successfully. Building file list...",
    "Found project source files. Initializing Static Code Analysis rules...",
    "Running rule [TODO_COMMENT_RULE] on all source files...",
    "Rule [TODO_COMMENT_RULE] complete.",
    "Running rule [SENSITIVE_FILE_RULE] on configurations...",
    "Running rule [SQL_INJECTION_RULE] on source classes...",
    "Running rule [HARDCODED_SECRET_RULE] on environment files...",
    "Running rule [EMPTY_CATCH_BLOCK_RULE] on exceptions handler...",
    "Running rule [DEBUG_MODE_RULE] on configuration profiles...",
    "Rules run completed. Executing vulnerability score calculator...",
    "Generating static audit report (JSON format)...",
    "Analysis completed. Committing results to repository database."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setLogIndex((prev) => (prev < logs.length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-center justify-between p-8 bg-card/20 border border-border/80 rounded-2xl backdrop-blur-md relative overflow-hidden mb-8">
      <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-20%] w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />

      {/* Pulsing Radar Circle */}
      <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
        <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-75" />
        <div className="absolute inset-4 rounded-full border border-primary/40 animate-pulse" />
        <div className="absolute inset-8 rounded-full border border-primary/60" />
        <div className="absolute w-24 h-0.5 bg-gradient-to-r from-transparent to-primary origin-left animate-[spin_3s_linear_infinite]" style={{ transformOrigin: '0% 50%' }} />

        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/20">
          <Terminal className="h-5 w-5 animate-pulse" />
        </div>
      </div>

      {/* Terminal Log Console */}
      <div className="flex-1 w-full flex flex-col h-48 bg-black/80 border border-zinc-800 rounded-xl overflow-hidden font-mono text-[11px] leading-relaxed p-4 text-zinc-400">
        <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2 mb-2 shrink-0">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-zinc-500 ml-2">devguardian-scanner-console.log</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1.5 flex flex-col-reverse justify-end pr-1 text-left">
          {logs.slice(0, logIndex + 1).reverse().map((log, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-zinc-600 shrink-0">[{new Date().toLocaleTimeString()}]</span>
              <span className={log.includes("complete") ? "text-emerald-400" : "text-zinc-300"}>
                {log}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Split Code Diff remediation sidebar
interface DiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  severity: string;
  category: string;
  recommendation: string;
  filePath: string;
  lineNo: number;
}

const RemediationDiffModal: React.FC<DiffModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  severity,
  category,
  recommendation,
  filePath,
  lineNo
}) => {
  if (!isOpen) return null;

  let originalCode = `try {\n    // Code that might fail\n} catch (Exception e) {\n    // Empty block\n}`;
  let fixedCode = `try {\n    // Code that might fail\n} catch (Exception e) {\n    log.error("Execution failed", e);\n    throw new CustomException("Failed to run task", e);\n}`;

  if (title.toLowerCase().includes("sql injection")) {
    originalCode = `String query = "SELECT * FROM users WHERE username = " + username;\nStatement statement = connection.createStatement();\nResultSet resultSet = statement.executeQuery(query);`;
    fixedCode = `String query = "SELECT * FROM users WHERE username = ?";\nPreparedStatement preparedStatement = connection.prepareStatement(query);\npreparedStatement.setString(1, username);\nResultSet resultSet = preparedStatement.executeQuery();`;
  } else if (title.toLowerCase().includes("secret") || title.toLowerCase().includes("key")) {
    originalCode = `String secretKey = "sk_live_51Nz84..."; // Hardcoded credentials`;
    fixedCode = `String secretKey = System.getenv("DEVGUARDIAN_SECRET_KEY"); // Read from env variables`;
  } else if (filePath.endsWith(".properties") || filePath.endsWith(".env") || title.toLowerCase().includes("debug")) {
    originalCode = `debug=true\nspring.datasource.password="admin123"`;
    fixedCode = `debug=false\nspring.datasource.password=\${DATABASE_PASSWORD}`;
  } else if (title.toLowerCase().includes("todo")) {
    originalCode = `// TODO: Implement user verification logic`;
    fixedCode = `if (user.isVerified()) {\n    proceedToDashboard();\n} else {\n    throw new UnauthorizedException();\n}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
      <div className="h-full w-full max-w-2xl bg-zinc-950 border-l border-zinc-800 flex flex-col justify-between shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white">
          <X className="h-4 w-4" />
        </button>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-left">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                severity.toLowerCase() === "critical" ? "bg-red-500/10 text-red-400" :
                severity.toLowerCase() === "high" || severity.toLowerCase() === "warning" ? "bg-amber-500/10 text-amber-400" :
                "bg-blue-500/10 text-blue-400"
              }`}>
                {severity}
              </span>
              <span className="text-zinc-600 text-xs">•</span>
              <span className="text-xs text-muted-foreground uppercase font-semibold">{category}</span>
            </div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <p className="text-xs text-zinc-500 font-mono mt-1">{filePath}:{lineNo}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Vulnerability Description</h4>
            <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/40">{description}</p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Proposed Secure Diff Remediation</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col rounded-xl border border-red-500/20 bg-red-950/5 overflow-hidden font-mono text-[10px] leading-relaxed">
                <div className="bg-red-500/10 border-b border-red-500/20 px-3 py-1.5 text-red-400 font-bold text-[9px] uppercase tracking-wider flex items-center justify-between">
                  <span>Vulnerable Code</span>
                  <span>Before</span>
                </div>
                <pre className="p-3 overflow-x-auto text-zinc-400 text-left bg-black/25">
                  {originalCode}
                </pre>
              </div>

              <div className="flex flex-col rounded-xl border border-emerald-500/20 bg-emerald-950/5 overflow-hidden font-mono text-[10px] leading-relaxed">
                <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-3 py-1.5 text-emerald-400 font-bold text-[9px] uppercase tracking-wider flex items-center justify-between">
                  <span>Secured Remediation</span>
                  <span>After</span>
                </div>
                <pre className="p-3 overflow-x-auto text-zinc-400 text-left bg-black/25">
                  {fixedCode}
                </pre>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gemini Recommendation</h4>
            <p className="text-xs text-zinc-400 bg-primary/5 p-4 rounded-xl border border-primary/10 leading-relaxed">
              {recommendation}
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-zinc-800 bg-zinc-900/20 flex gap-4 shrink-0 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors">
            Close Panel
          </button>
          <button className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/95 text-white shadow-lg shadow-primary/20 flex items-center gap-1.5 transition-all">
            Apply Patch
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

function AnalysisPageContent() {
  const searchParams = useSearchParams();
  const repoIdParam = searchParams.get("repoId");
  const analysisIdParam = searchParams.get("analysisId");

  const dispatch = useAppDispatch();

  const repoId = repoIdParam ? parseInt(repoIdParam, 10) : null;
  const analysisId = analysisIdParam ? parseInt(analysisIdParam, 10) : null;

  const { currentRepository, repositories } = useAppSelector((state) => state.repo);
  const { analyses, issues, currentAnalysis, loading } = useAppSelector(
    (state) => state.analysis
  );

  const [localScanning, setLocalScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [selectedIssue, setSelectedIssue] = useState<IssueResponse | null>(null);

  // 1. Fetch Repositories on Mount
  useEffect(() => {
    dispatch(fetchRepositories());
  }, [dispatch]);

  // 2. Redirect to the first repository if no repoId is specified in URL query
  useEffect(() => {
    if (!repoId && repositories.length > 0) {
      window.location.replace(`/analysis?repoId=${repositories[0].id}`);
    }
  }, [repoId, repositories]);

  // 3. Fetch Repository Details & Scan History
  useEffect(() => {
    if (repoId) {
      dispatch(fetchRepositoryById(repoId));
      dispatch(fetchRepositoryAnalyses(repoId));
    }
  }, [repoId, dispatch]);

  // 4. Determine active analysis run and fetch its detected issues
  const activeAnalysis = currentAnalysis || (analyses.length > 0 ? analyses[0] : null);
  const activeAnalysisId = analysisId || activeAnalysis?.id;

  useEffect(() => {
    if (activeAnalysisId) {
      dispatch(fetchAnalysisIssues(activeAnalysisId));
    }
  }, [activeAnalysisId, dispatch]);

  // Poll for analysis status updates if the current active analysis is in a "RUNNING" state
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (activeAnalysisId && activeAnalysis?.status === "RUNNING") {
      intervalId = setInterval(() => {
        if (repoId) {
          dispatch(fetchRepositoryAnalyses(repoId));
        }
      }, 2000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeAnalysisId, activeAnalysis?.status, repoId, dispatch]);

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

  const isScanning = loading || localScanning || activeAnalysis?.status === "RUNNING";

  // Filter issues based on criteria
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          issue.filePath.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || issue.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesSeverity = severityFilter === "all" || issue.severity.toLowerCase() === severityFilter.toLowerCase();
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar currentPath="/analysis" />
        <main className="flex-1 p-6 md:p-8 bg-background overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="text-left flex-1">
              <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Security Analysis
                </h1>
                
                {/* Repository Dropdown Selector */}
                {repositories && repositories.length > 0 && (
                  <div className="relative inline-block text-left">
                    <select
                      value={repoId || ""}
                      onChange={(e) => {
                        const nextId = e.target.value;
                        if (nextId) {
                          window.location.href = `/analysis?repoId=${nextId}`;
                        }
                      }}
                      className="bg-zinc-900 border border-zinc-800 text-xs font-semibold text-white px-3.5 py-2 rounded-xl outline-none focus:border-primary/50 cursor-pointer appearance-none pr-9 relative"
                    >
                      <option value="" disabled>Select Repository</option>
                      {repositories.map((repo) => (
                        <option key={repo.id} value={repo.id}>
                          {repo.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
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

          {repoId ? (
            <>
              {/* 1. Radar scanning view if currently scanning */}
              {activeAnalysis?.status === "RUNNING" && <RadarScanner />}

              {/* 2. Interactive circular progress wheels if scan is complete */}
              {activeAnalysis && activeAnalysis.status === "COMPLETED" && (
                <section className="grid gap-6 grid-cols-1 sm:grid-cols-3 mb-8">
                  <ScoreCircle
                    score={activeAnalysis.securityScore || 0}
                    label="Security Score"
                    colorClass="text-emerald-400"
                    gradientId="securityGrad"
                    fromColor="#10b981"
                    toColor="#059669"
                  />
                  <ScoreCircle
                    score={activeAnalysis.qualityScore || 0}
                    label="Code Quality"
                    colorClass="text-amber-400"
                    gradientId="qualityGrad"
                    fromColor="#f59e0b"
                    toColor="#d97706"
                  />
                  <ScoreCircle
                    score={activeAnalysis.architectureScore || 0}
                    label="Architecture Design"
                    colorClass="text-indigo-400"
                    gradientId="architectureGrad"
                    fromColor="#6366f1"
                    toColor="#4f46e5"
                  />
                </section>
              )}

              {/* 3. Scanned summary card */}
              {activeAnalysis && activeAnalysis.status === "COMPLETED" && (
                <section className="mb-8">
                  <Card className="border-primary/20 bg-primary/5 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-start gap-4 text-left">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-white mb-2">DevGuardian Security Summary</h3>
                        <div className="text-xs text-muted-foreground leading-relaxed space-y-3">
                          <p>
                            DevGuardian analyzed <strong className="text-white">{currentRepository?.name || "repository"}</strong>. A scan audit completed successfully.
                          </p>
                          <ul className="list-disc pl-5 space-y-1 text-muted-foreground/90">
                            <li>Vulnerability Scan Results: Identified <strong className="text-white">{issues.length} Issues</strong>.</li>
                            <li>Critical/High Risks: <strong className="text-red-400">{issues.filter(i => i.severity.toUpperCase() === "CRITICAL" || i.severity.toUpperCase() === "HIGH").length} Alerts</strong>.</li>
                            <li>Remediations ready to resolve with single click commits.</li>
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

              {/* 4. Filters & Issues list */}
              {activeAnalysis?.status !== "RUNNING" && (
                <section className="flex flex-col gap-6">
                  {/* Filter controls */}
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-border pb-4">
                    <div className="relative w-full md:w-80">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search issues by title or file..."
                        className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-900/50 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors animate-[fadeIn_0.2s_ease-out]"
                      />
                    </div>

                    <div className="flex items-center gap-4 flex-wrap w-full md:w-auto">
                      {/* Category Filter */}
                      <div className="flex rounded-xl bg-zinc-900/50 border border-zinc-800 p-0.5 text-xs font-semibold text-muted-foreground">
                        <button
                          onClick={() => setCategoryFilter("all")}
                          className={`px-3 py-1 rounded-lg transition-colors ${categoryFilter === "all" ? "bg-primary text-white" : "hover:text-white"}`}
                        >
                          All Classes
                        </button>
                        <button
                          onClick={() => setCategoryFilter("security")}
                          className={`px-3 py-1 rounded-lg transition-colors ${categoryFilter === "security" ? "bg-primary text-white" : "hover:text-white"}`}
                        >
                          Security
                        </button>
                        <button
                          onClick={() => setCategoryFilter("quality")}
                          className={`px-3 py-1 rounded-lg transition-colors ${categoryFilter === "quality" ? "bg-primary text-white" : "hover:text-white"}`}
                        >
                          Code Quality
                        </button>
                      </div>

                      {/* Severity Filter */}
                      <div className="flex rounded-xl bg-zinc-900/50 border border-zinc-800 p-0.5 text-xs font-semibold text-muted-foreground">
                        <button
                          onClick={() => setSeverityFilter("all")}
                          className={`px-3 py-1 rounded-lg transition-colors ${severityFilter === "all" ? "bg-primary text-white" : "hover:text-white"}`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setSeverityFilter("critical")}
                          className={`px-3 py-1 rounded-lg transition-colors ${severityFilter === "critical" ? "bg-primary text-white" : "hover:text-white"}`}
                        >
                          Critical
                        </button>
                        <button
                          onClick={() => setSeverityFilter("high")}
                          className={`px-3 py-1 rounded-lg transition-colors ${severityFilter === "high" ? "bg-primary text-white" : "hover:text-white"}`}
                        >
                          High
                        </button>
                        <button
                          onClick={() => setSeverityFilter("low")}
                          className={`px-3 py-1 rounded-lg transition-colors ${severityFilter === "low" ? "bg-primary text-white" : "hover:text-white"}`}
                        >
                          Low
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Issues Grid */}
                  {filteredIssues.length === 0 ? (
                    <div className="text-center py-16 text-sm text-muted-foreground border border-dashed border-border rounded-2xl bg-card/10">
                      {isScanning ? "Scanning codebase..." : "No vulnerabilities or issues identified matching your filters."}
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {filteredIssues.map((issue) => (
                        <div
                          key={issue.id}
                          onClick={() => setSelectedIssue(issue)}
                          className="cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                        >
                          <IssueCard
                            title={issue.title}
                            description={issue.description}
                            severity={issue.severity.toLowerCase() as any}
                            filePath={issue.filePath}
                            lineNo={issue.lineNumber}
                            category={issue.category.toLowerCase() as any}
                            codeSnippet={`Rule Code: ${issue.ruleCode}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Drawer Diff Remediation Modal */}
              {selectedIssue && (
                <RemediationDiffModal
                  isOpen={selectedIssue !== null}
                  onClose={() => setSelectedIssue(null)}
                  title={selectedIssue.title}
                  description={selectedIssue.description}
                  severity={selectedIssue.severity}
                  category={selectedIssue.category}
                  recommendation={selectedIssue.recommendation}
                  filePath={selectedIssue.filePath}
                  lineNo={selectedIssue.lineNumber}
                />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-20 px-6 border border-dashed border-border rounded-2xl bg-card/10 max-w-2xl mx-auto my-12 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                <Play className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">No Repository Selected</h3>
                <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                  Choose a repository from the selector at the top or link a new one to start analyzing codebase vulnerabilities.
                </p>
              </div>
              <a href="/repositories">
                <Button size="sm">Go to Repositories</Button>
              </a>
            </div>
          )}
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
