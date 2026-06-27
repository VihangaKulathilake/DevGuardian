"use client";

import * as React from "react";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
    <div className="flex flex-col items-center gap-3 bg-[#0d0d14]/75 p-6 border border-border/80 hover:border-cyber-cyan/35 hover:shadow-[0_0_15px_rgba(0,240,255,0.15)] transition-all duration-300 backdrop-blur-md cyber-card-clip">
      <div className="relative h-28 w-28 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 112 112">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={fromColor} />
              <stop offset="100%" stopColor={toColor} />
            </linearGradient>
          </defs>
          <circle
            cx="56"
            cy="56"
            r={radius}
            className="stroke-zinc-900"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="56"
            cy="56"
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 6px ${fromColor})` }}
          />
        </svg>
        <span className="absolute text-xl font-bold font-mono text-white">{score}</span>
      </div>
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-orbitron">{label}</span>
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
    <div className="flex flex-col lg:flex-row gap-8 items-center justify-between p-8 bg-[#0b0b14]/75 border border-border/80 rounded-none cyber-card-clip backdrop-blur-md relative overflow-hidden mb-8">
      <div className="absolute inset-0 bg-[radial-gradient(rgba(0,240,255,0.06)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-cyber-cyan/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-20%] w-64 h-64 bg-cyber-purple/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />

      {/* Pulsing Radar Circle */}
      <div className="relative w-48 h-48 flex items-center justify-center shrink-0 border border-cyber-cyan/10 rounded-full bg-[#05050a]/40">
        <div className="absolute inset-0 rounded-full border border-cyber-cyan/20 animate-ping opacity-35" />
        <div className="absolute inset-4 rounded-full border border-cyber-cyan/35 animate-pulse" />
        <div className="absolute inset-12 rounded-full border border-cyber-cyan/50" />
        <div className="absolute w-24 h-0.5 bg-gradient-to-r from-transparent to-cyber-cyan origin-left animate-radar-sweep" style={{ transformOrigin: '0% 50%' }} />

        <div className="h-12 w-12 rounded-full bg-[#080814] border border-cyber-cyan flex items-center justify-center text-cyber-cyan shadow-[0_0_12px_rgba(0,240,255,0.4)] relative z-10">
          <Terminal className="h-5 w-5 animate-pulse" />
        </div>
      </div>

      {/* Terminal Log Console */}
      <div className="flex-1 w-full flex flex-col h-48 bg-[#030306]/90 border border-border rounded-none cyber-card-clip font-mono text-[10px] leading-relaxed p-4 text-zinc-400 relative">
        <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-cyber-pink animate-pulse" />
            <span className="text-[9px] text-white font-bold uppercase tracking-wider font-orbitron">security-scanner-console.log</span>
          </div>
          <Badge variant="info" className="scale-75 origin-right">Live Audit</Badge>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1.5 flex flex-col-reverse justify-end pr-1 text-left">
          {logs.slice(0, logIndex + 1).reverse().map((log, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-cyber-cyan/60 shrink-0 select-none">&gt;&gt;</span>
              <span className={log.includes("complete") || log.includes("successfully") ? "text-[#00ff66]" : log.includes("Running") ? "text-cyber-cyan" : "text-zinc-300"}>
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
    originalCode = `String secretKey = "stripe_api_key_placeholder_12345"; // Hardcoded credentials`;
    fixedCode = `String secretKey = System.getenv("DEVGUARDIAN_SECRET_KEY"); // Read from env variables`;
  } else if (filePath.endsWith(".properties") || filePath.endsWith(".env") || title.toLowerCase().includes("debug")) {
    originalCode = `debug=true\nspring.datasource.password="admin123"`;
    fixedCode = `debug=false\nspring.datasource.password=\${DATABASE_PASSWORD}`;
  } else if (title.toLowerCase().includes("todo")) {
    originalCode = `// TODO: Implement user verification logic`;
    fixedCode = `if (user.isVerified()) {\n    proceedToDashboard();\n} else {\n    throw new UnauthorizedException();\n}`;
  }

  // Safe keyword highlighter
  const highlightLine = (line: string) => {
    if (!line || line.trim() === "") return <span>&nbsp;</span>;
    let html = line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const commentIndex = html.indexOf("//");
    let commentHtml = "";
    if (commentIndex !== -1) {
      commentHtml = `<span class="text-zinc-500 font-normal font-mono">${html.substring(commentIndex)}</span>`;
      html = html.substring(0, commentIndex);
    }
    html = html.replace(/"([^"]*)"/g, '<span class="text-cyber-yellow font-mono">"$1"</span>');
    const keywords = ["class", "public", "private", "protected", "return", "new", "throw", "try", "catch", "final", "void", "static", "if", "else", "true", "false"];
    const typeKeywords = ["String", "int", "boolean", "double", "float", "long", "char", "Exception"];
    const apiClasses = ["System", "PreparedStatement", "Statement", "Connection", "ResultSet", "log", "error", "getenv"];

    keywords.forEach(kw => {
      const regex = new RegExp(`\\b(${kw})\\b`, "g");
      html = html.replace(regex, '<span class="text-cyber-pink font-bold font-mono">$1</span>');
    });
    typeKeywords.forEach(tk => {
      const regex = new RegExp(`\\b(${tk})\\b`, "g");
      html = html.replace(regex, '<span class="text-cyber-purple font-semibold font-mono">$1</span>');
    });
    apiClasses.forEach(ac => {
      const regex = new RegExp(`\\b(${ac})\\b`, "g");
      html = html.replace(regex, '<span class="text-cyber-cyan font-medium font-mono">$1</span>');
    });
    if (commentHtml) html += commentHtml;
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-[#030306]/85 backdrop-blur-md">
      <div className="h-full w-full max-w-2xl bg-[#08080c]/95 border-l border-cyber-cyan/15 flex flex-col justify-between shadow-2xl relative animate-in slide-in-from-right duration-300">
        <div className="absolute inset-0 cyber-grid-dot opacity-25 pointer-events-none" />
        <div className="tech-corner-accent scale-75 origin-top-left" />

        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 h-9 w-9 border border-border/80 hover:border-cyber-cyan/35 bg-[#12121a]/60 hover:bg-secondary/40 text-muted-foreground hover:text-cyber-cyan flex items-center justify-center transition-all duration-200 cyber-btn-clip cursor-pointer z-20"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-left relative z-10 mt-6">
          <div>
            <div className="flex items-center gap-2 mb-2 select-none">
              <Badge variant={severity.toLowerCase() === "critical" || severity.toLowerCase() === "high" ? "error" : "warning"}>
                {severity}
              </Badge>
              <span className="text-zinc-700 text-xs font-mono select-none">//</span>
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">{category}</span>
            </div>
            <h2 className="text-lg font-black uppercase tracking-wider text-white font-orbitron mt-1.5">{title}</h2>
            
            <div className="flex items-center gap-2 text-[10px] font-mono text-cyber-cyan bg-[#090e18] border border-cyber-cyan/20 px-3 py-1.5 mt-2 inline-flex">
              <span className="text-zinc-500">FILE DIRECTORY:</span>
              <span className="text-white">{filePath}:{lineNo}</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-orbitron">Threat Diagnosis</h4>
            <p className="text-xs text-zinc-300 leading-relaxed bg-[#0b0b14]/90 p-4 border border-border/80 rounded-none cyber-card-clip">
              {description}
            </p>
          </div>

          {/* Code blocks with line alignment and syntax highlighting */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-orbitron">Proposed Secure Diff Patch</h4>
            <div className="flex flex-col gap-4">
              
              {/* Vulnerable Code block */}
              <div className="flex flex-col border border-cyber-pink/25 bg-[#240a12]/10 rounded-none font-mono text-[11px] leading-relaxed">
                <div className="bg-[#240a12]/20 border-b border-cyber-pink/20 px-3 py-2 text-cyber-pink font-bold text-[8px] uppercase tracking-widest flex items-center justify-between font-orbitron select-none">
                  <span>Vulnerable Code</span>
                  <span className="opacity-60">BEFORE PATCH</span>
                </div>
                <div className="p-3 bg-black/45 overflow-x-auto min-h-[100px]">
                  {originalCode.split("\n").map((line, idx) => (
                    <div key={idx} className="flex items-stretch select-none">
                      <div className="w-8 text-right pr-2.5 text-zinc-500 border-r border-zinc-800 bg-black/10 text-[10px]">
                        {lineNo + idx}
                      </div>
                      <div className="flex-1 pl-2.5 text-rose-300 overflow-x-auto whitespace-pre font-mono">
                        {highlightLine(line)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Secured Code block */}
              <div className="flex flex-col border border-[#00ff66]/25 bg-[#051e12]/10 rounded-none font-mono text-[11px] leading-relaxed">
                <div className="bg-[#051e12]/20 border-b border-[#00ff66]/20 px-3 py-2 text-[#00ff66] font-bold text-[8px] uppercase tracking-widest flex items-center justify-between font-orbitron select-none">
                  <span>Secured Remediation</span>
                  <span className="opacity-60 animate-pulse">GEMINI AUTO-FIX</span>
                </div>
                <div className="p-3 bg-black/45 overflow-x-auto min-h-[100px]">
                  {fixedCode.split("\n").map((line, idx) => (
                    <div key={idx} className="flex items-stretch select-none">
                      <div className="w-8 text-right pr-2.5 text-zinc-500 border-r border-zinc-800 bg-black/10 text-[10px]">
                        {lineNo + idx}
                      </div>
                      <div className="flex-1 pl-2.5 text-emerald-300 overflow-x-auto whitespace-pre font-mono">
                        {highlightLine(line)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* AI Recommendation in conic border flow */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-orbitron flex items-center gap-1.5 select-none">
              <Sparkles className="h-3.5 w-3.5 text-cyber-cyan animate-pulse" />
              Gemini Automated Recommendation
            </h4>
            <div className="glow-card-flow p-[1px] shadow-lg cyber-card-clip">
              <div className="bg-[#0b0b14] p-4 text-xs text-zinc-300 leading-relaxed font-mono relative z-10">
                {recommendation}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border/80 bg-[#07070b]/90 flex gap-4 shrink-0 justify-end relative z-10 select-none">
          <Button 
            onClick={onClose} 
            variant="secondary"
            size="sm"
            className="font-mono text-[10px]"
          >
            Close Panel
          </Button>
          <Button 
            variant="primary"
            size="sm"
            className="flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.3)] animate-pulse font-mono text-[10px]"
          >
            Apply Fix Patch
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

function AnalysisPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
    <div className="flex flex-col min-h-screen bg-[#030306] cyber-grid-bg text-foreground">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar currentPath="/analysis" />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-[1600px] mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-cyber-cyan/15 pb-6">
            <div className="text-left flex-1">
              <div className="flex items-center gap-4 mb-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-white uppercase tracking-wider leading-none">
                  SECURITY ANALYSIS ENGINE
                </h1>
                
                {/* Repository Dropdown Selector */}
                {repositories && repositories.length > 0 && (
                  <div className="relative inline-block text-left select-none font-mono">
                    <select
                      value={repoId || ""}
                      onChange={(e) => {
                        const nextId = e.target.value;
                        if (nextId) {
                          window.location.href = `/analysis?repoId=${nextId}`;
                        }
                      }}
                      className="bg-[#0c0c14] border border-cyber-cyan/35 text-xs font-mono font-bold text-cyber-cyan px-4 py-2 rounded-none outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan/35 cursor-pointer appearance-none pr-9 relative uppercase tracking-wider"
                    >
                      <option value="" disabled className="font-mono">Select Target</option>
                      {repositories.map((repo) => (
                        <option key={repo.id} value={repo.id} className="font-mono text-zinc-300">
                          {repo.name.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-cyber-cyan">
                      <svg className="fill-current h-4.5 w-4.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                Execute automated static audits, view metric profiles, and resolve codebase threats.
              </p>
            </div>

            {repoId && (
              <Button
                onClick={runScan}
                loading={isScanning}
                className="sm:w-auto shadow-[0_0_15px_rgba(0,240,255,0.45)] flex items-center justify-center gap-2 py-3 shrink-0"
              >
                <Play className="h-4.5 w-4.5 shrink-0" fill="currentColor" />
                TRIGGER COCKPIT SCAN
              </Button>
            )}
          </div>

          {repoId ? (
            <>
              {/* 1. Radar scanning view if currently scanning */}
              {activeAnalysis?.status === "RUNNING" && <RadarScanner />}

              {/* 2. Interactive circular progress wheels if scan is complete */}
              {activeAnalysis && activeAnalysis.status === "COMPLETED" && (
                <section className="grid gap-6 grid-cols-1 sm:grid-cols-3">
                  <ScoreCircle
                    score={activeAnalysis.securityScore || 0}
                    label="Security Index"
                    colorClass="text-cyber-green"
                    gradientId="securityGrad"
                    fromColor="#00ff66"
                    toColor="#059669"
                  />
                  <ScoreCircle
                    score={activeAnalysis.qualityScore || 0}
                    label="Code Legibility"
                    colorClass="text-cyber-yellow"
                    gradientId="qualityGrad"
                    fromColor="#fffb00"
                    toColor="#d97706"
                  />
                  <ScoreCircle
                    score={activeAnalysis.architectureScore || 0}
                    label="Structural Design"
                    colorClass="text-cyber-cyan"
                    gradientId="architectureGrad"
                    fromColor="#00f0ff"
                    toColor="#4f46e5"
                  />
                </section>
              )}

              {/* 3. Scanned summary card */}
              {activeAnalysis && activeAnalysis.status === "COMPLETED" && (
                <section>
                  <Card className="border-cyber-cyan/35 bg-[#090e18]/85 p-6 relative overflow-hidden">
                    {/* Glowing corner decals */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-cyan/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex items-start gap-4.5 text-left relative z-10">
                      <div className="h-11 w-11 border border-cyber-cyan bg-cyber-cyan/10 text-cyber-cyan flex items-center justify-center shrink-0 shadow-[0_0_12px_#00f0ff25]">
                        <Sparkles className="h-5.5 w-5.5 animate-pulse" />
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <h3 className="text-xs font-orbitron font-extrabold text-white uppercase tracking-wider">
                          DevGuardian Automated Security Report
                        </h3>
                        
                        <div className="text-xs text-zinc-300 leading-relaxed space-y-3 font-sans">
                          <p className="font-medium">
                            DevGuardian static scanner analyzed <strong className="text-white font-mono uppercase">{currentRepository?.name || "codebase"}</strong>. The audit is complete.
                          </p>
                          
                          <ul className="space-y-1.5 text-zinc-400 font-medium">
                            <li className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 bg-cyber-cyan rounded-none shrink-0" />
                              Scan Results: Flagged <strong className="text-white font-mono">{issues.length} total issues</strong>.
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 bg-cyber-pink rounded-none shrink-0" />
                              Severe Risks: Flagged <strong className="text-cyber-pink font-mono">{issues.filter(i => i.severity.toUpperCase() === "CRITICAL" || i.severity.toUpperCase() === "HIGH").length} critical alerts</strong>.
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 bg-cyber-green rounded-none shrink-0" />
                              Status: Automated AI diff remediation patches are compiled and ready to deploy.
                            </li>
                          </ul>
                          
                          <div className="pt-2 flex items-center gap-2 select-none">
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="h-9 gap-1.5 border-zinc-800/80 hover:border-cyber-cyan text-zinc-300 hover:text-cyber-cyan font-mono text-[10px]"
                            >
                              <GitPullRequest className="h-4 w-4 shrink-0" />
                              APPLY REMEDIATIONS
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
                  <div className="flex flex-col lg:flex-row gap-5 items-center justify-between border-b border-zinc-800 pb-5">
                    
                    {/* Search bar */}
                    <div className="relative w-full lg:w-80">
                      <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search issues by keyword..."
                        className="w-full pl-10 pr-4 py-2.5 text-xs rounded-none border border-zinc-800 bg-[#07070b]/90 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/35 transition-colors font-mono"
                      />
                    </div>

                    <div className="flex items-center gap-4 flex-wrap w-full lg:w-auto select-none font-mono">
                      {/* Category Filter Tab Selector */}
                      <div className="flex border border-zinc-800 bg-black/45 p-0.5 text-[9px] font-bold uppercase tracking-wider">
                        <button
                          onClick={() => setCategoryFilter("all")}
                          className={`px-3 py-1.5 transition-colors cursor-pointer ${categoryFilter === "all" ? "bg-cyber-cyan text-black" : "text-zinc-500 hover:text-zinc-300"}`}
                        >
                          All Classes
                        </button>
                        <button
                          onClick={() => setCategoryFilter("security")}
                          className={`px-3 py-1.5 transition-colors cursor-pointer ${categoryFilter === "security" ? "bg-cyber-cyan text-black" : "text-zinc-500 hover:text-zinc-300"}`}
                        >
                          Security
                        </button>
                        <button
                          onClick={() => setCategoryFilter("quality")}
                          className={`px-3 py-1.5 transition-colors cursor-pointer ${categoryFilter === "quality" ? "bg-cyber-cyan text-black" : "text-zinc-500 hover:text-zinc-300"}`}
                        >
                          Code Quality
                        </button>
                      </div>

                      {/* Severity Filter Tab Selector */}
                      <div className="flex border border-zinc-800 bg-black/45 p-0.5 text-[9px] font-bold uppercase tracking-wider">
                        <button
                          onClick={() => setSeverityFilter("all")}
                          className={`px-3 py-1.5 transition-colors cursor-pointer ${severityFilter === "all" ? "bg-cyber-cyan text-black" : "text-zinc-500 hover:text-zinc-300"}`}
                        >
                          All Levels
                        </button>
                        <button
                          onClick={() => setSeverityFilter("critical")}
                          className={`px-3 py-1.5 transition-colors cursor-pointer ${severityFilter === "critical" ? "bg-cyber-cyan text-black" : "text-zinc-500 hover:text-zinc-300"}`}
                        >
                          Critical
                        </button>
                        <button
                          onClick={() => setSeverityFilter("high")}
                          className={`px-3 py-1.5 transition-colors cursor-pointer ${severityFilter === "high" ? "bg-cyber-cyan text-black" : "text-zinc-500 hover:text-zinc-300"}`}
                        >
                          High
                        </button>
                        <button
                          onClick={() => setSeverityFilter("low")}
                          className={`px-3 py-1.5 transition-colors cursor-pointer ${severityFilter === "low" ? "bg-cyber-cyan text-black" : "text-zinc-500 hover:text-zinc-300"}`}
                        >
                          Low
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Issues Grid */}
                  {filteredIssues.length === 0 ? (
                    <div className="text-center py-16 text-xs font-mono text-zinc-500 border border-dashed border-zinc-800 bg-[#0b0b14]/20 uppercase tracking-widest select-none">
                      {isScanning ? "// Engine scan in progress..." : "// No vulnerability issues identified."}
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {filteredIssues.map((issue) => (
                        <div
                          key={issue.id}
                          onClick={() => {
                            const query = new URLSearchParams({
                              title: issue.title,
                              description: issue.description,
                              severity: issue.severity,
                              category: issue.category,
                              recommendation: issue.recommendation,
                              filePath: issue.filePath,
                              lineNumber: String(issue.lineNumber || 0),
                              ruleCode: issue.ruleCode,
                              repoId: String(repoId || ""),
                              codeSnippet: issue.codeSnippet || ""
                            }).toString();
                            router.push(`/analysis/recommendation?${query}`);
                          }}
                          className="cursor-pointer transition-all duration-300 hover:-translate-y-1"
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
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-zinc-800 bg-[#0b0b14]/20 max-w-xl mx-auto my-12 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="absolute inset-0 cyber-grid-dot opacity-10 pointer-events-none" />
              <div className="h-14 w-14 border border-cyber-cyan bg-cyber-cyan/10 flex items-center justify-center text-cyber-cyan shadow-[0_0_12px_rgba(0,240,255,0.25)] relative z-10 animate-pulse">
                <Play className="h-7 w-7" />
              </div>
              <div className="space-y-1.5 relative z-10">
                <h3 className="text-xs font-orbitron font-extrabold text-white uppercase tracking-wider">NO SCAN TARGET SELECTED</h3>
                <p className="text-[11px] text-zinc-400 font-sans max-w-sm leading-relaxed">
                  Select a repository database from the cockpit selector at the top or link codebases to initialize system audits.
                </p>
              </div>
              <a href="/repositories" className="relative z-10 select-none">
                <Button size="sm" variant="secondary" className="border-zinc-800 hover:border-cyber-cyan font-mono py-2">
                  GO TO REPOSITORY MANAGER
                </Button>
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
    <Suspense fallback={<div className="text-center py-20 text-muted-foreground font-orbitron uppercase tracking-widest">Loading Analysis Screen...</div>}>
      <AnalysisPageContent />
    </Suspense>
  );
}
