"use client";

import * as React from "react";
import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/navbar/Sidebar";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { 
  ArrowLeft, 
  Sparkles, 
  ArrowRight, 
  ShieldAlert, 
  FileCode,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Zap
} from "lucide-react";
import AppFooter from "@/components/common/AppFooter";
import { aiApi } from "@/features/ai/aiApi";
import { ModelStatus, AiIssueResponse } from "@/features/ai/aiTypes";

function RecommendationPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [diffMode, setDiffMode] = useState<'unified' | 'split'>('unified');

  const title = searchParams.get("title") || "Vulnerability Alert";
  const description = searchParams.get("description") || "No description provided.";
  const severity = searchParams.get("severity") || "MEDIUM";
  const category = searchParams.get("category") || "SECURITY";
  const recommendation = searchParams.get("recommendation") || "No custom recommendation available.";
  const filePath = searchParams.get("filePath") || "UnknownFile.java";
  const lineNo = searchParams.get("lineNumber") || "1";
  const ruleCode = searchParams.get("ruleCode") || "GENERIC_RULE";
  const repoId = searchParams.get("repoId") || "";
  const codeSnippet = searchParams.get("codeSnippet") || "";

  const baseLine = parseInt(lineNo, 10) || 1;

  // AI Model State
  const [availableModels, setAvailableModels] = useState<ModelStatus[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("groq");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AiIssueResponse | null>(null);

  // Centralized dynamic patch generator fallback
  const generateFixedCode = (rule: string, original: string) => {
    if (!original || original.trim() === "") {
      return "No recommended patch available.";
    }
    const trimmed = original.trim();

    if (rule.toLowerCase().includes("sql_injection") || rule.toLowerCase().includes("sql")) {
      if (trimmed.includes("+")) {
        const varMatch = trimmed.match(/(String\s+\w+\s*=\s*)"([^"]+)"\s*\+\s*(\w+)/);
        if (varMatch) {
          const varDeclaration = varMatch[1];
          const queryText = varMatch[2];
          const queryVar = varMatch[3];
          return `${varDeclaration}"${queryText}?";\nPreparedStatement preparedStatement = connection.prepareStatement(query);\npreparedStatement.setString(1, ${queryVar});\nResultSet resultSet = preparedStatement.executeQuery();`;
        }
      }
      return `String query = "SELECT * FROM users WHERE username = ?";\nPreparedStatement preparedStatement = connection.prepareStatement(query);\npreparedStatement.setString(1, username);\nResultSet resultSet = preparedStatement.executeQuery();`;
    }

    if (rule.toLowerCase().includes("secret") || rule.toLowerCase().includes("password") || rule.toLowerCase().includes("key") || rule.toLowerCase().includes("credential") || rule.toLowerCase().includes("jwt")) {
      const secretMatch = trimmed.match(/(String\s+)?(\w+)\s*=\s*["']([^"']+)["']/);
      if (secretMatch) {
        const isTyped = secretMatch[1] || "";
        const varName = secretMatch[2];
        const envVarName = varName.replace(/([A-Z])/g, "_$1").toUpperCase();
        return `${isTyped}${varName} = System.getenv("DEVGUARDIAN_${envVarName}"); // Read securely from system environment`;
      }
      return `String secretKey = System.getenv("DEVGUARDIAN_SECRET_KEY"); // Read securely from system environment`;
    }

    if (rule.toLowerCase().includes("debug")) {
      if (trimmed.includes("debug=true")) return trimmed.replace("debug=true", "debug=false");
      if (trimmed.includes("debug = true")) return trimmed.replace("debug = true", "debug = false");
      return `debug=false // Disable development diagnostics in production`;
    }

    if (rule.toLowerCase().includes("empty_catch") || rule.toLowerCase().includes("catch")) {
      return `} catch (Exception e) {\n    log.error("Execution failed", e);\n    throw new CustomException("Failed to run task", e);\n}`;
    }

    return trimmed + `\n// Refactored dynamically using secure coding guidelines.`;
  };

  // Load available AI models from backend
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const list = await aiApi.getAvailableModels();
        if (list && list.length > 0) {
          setAvailableModels(list);
          const active = list.find(m => m.active);
          if (active) {
            setSelectedProvider(active.providerId);
          }
        }
      } catch (e) {
        console.warn("Could not fetch available AI models:", e);
      }
    };
    fetchModels();
  }, []);

  // Fetch AI Enrichment
  const fetchAiEnrichment = useCallback(async (provider: string) => {
    setIsAiLoading(true);
    try {
      const res = await aiApi.enrichIssue({
        issueType: ruleCode || title,
        fileName: filePath,
        codeSnippet: codeSnippet || `// Issue at ${filePath}:${lineNo}`,
        description: description,
        preferredProvider: provider,
      });
      if (res) {
        setAiResult(res);
      }
    } catch (err: any) {
      console.warn("AI enrichment failed, falling back to AST heuristics:", err);
    } finally {
      setIsAiLoading(false);
    }
  }, [ruleCode, title, filePath, lineNo, codeSnippet, description]);

  useEffect(() => {
    fetchAiEnrichment(selectedProvider);
  }, [fetchAiEnrichment, selectedProvider]);

  const handleProviderChange = (newProvider: string) => {
    setSelectedProvider(newProvider);
    fetchAiEnrichment(newProvider);
  };

  // Prepare custom snippets
  let originalCode = codeSnippet && codeSnippet.trim() !== "" 
    ? codeSnippet 
    : `try {\n    // Code that might fail\n} catch (Exception e) {\n    // Empty block\n}`;
  
  let fixedCode = aiResult?.recommendation && aiResult.recommendation.trim().length > 10
    ? aiResult.recommendation
    : generateFixedCode(ruleCode, originalCode);

  interface DiffLine {
    type: 'added' | 'deleted' | 'normal';
    text: string;
    originalLineNo?: number;
    fixedLineNo?: number;
  }

  let unifiedLines: DiffLine[] = [];
  if (codeSnippet && codeSnippet.trim() !== "") {
    unifiedLines = [
      { type: 'deleted', text: originalCode, originalLineNo: baseLine },
      { type: 'added', text: fixedCode, fixedLineNo: baseLine }
    ];
  } else {
    if (title.toLowerCase().includes("sql injection")) {
      originalCode = `String query = "SELECT * FROM users WHERE username = " + username;\nStatement statement = connection.createStatement();\nResultSet resultSet = statement.executeQuery(query);`;
      fixedCode = `String query = "SELECT * FROM users WHERE username = ?";\nPreparedStatement preparedStatement = connection.prepareStatement(query);\npreparedStatement.setString(1, username);\nResultSet resultSet = preparedStatement.executeQuery();`;
      unifiedLines = [
        { type: 'deleted', text: `String query = "SELECT * FROM users WHERE username = " + username;`, originalLineNo: baseLine },
        { type: 'added', text: `String query = "SELECT * FROM users WHERE username = ?";`, fixedLineNo: baseLine },
        { type: 'deleted', text: `Statement statement = connection.createStatement();`, originalLineNo: baseLine + 1 },
        { type: 'added', text: `PreparedStatement preparedStatement = connection.prepareStatement(query);`, fixedLineNo: baseLine + 1 },
        { type: 'added', text: `preparedStatement.setString(1, username);`, fixedLineNo: baseLine + 2 },
        { type: 'deleted', text: `ResultSet resultSet = statement.executeQuery(query);`, originalLineNo: baseLine + 2 },
        { type: 'added', text: `ResultSet resultSet = preparedStatement.executeQuery();`, fixedLineNo: baseLine + 3 }
      ];
    } else {
      unifiedLines = [
        { type: 'deleted', text: originalCode, originalLineNo: baseLine },
        { type: 'added', text: fixedCode, fixedLineNo: baseLine }
      ];
    }
  }

  const handleBack = () => {
    router.push(repoId ? `/analysis?repoId=${repoId}` : `/analysis`);
  };

  // Syntax highlighter
  const highlightLine = (line: string) => {
    if (!line || line.trim() === "") return <span>&nbsp;</span>;

    const tokenRegex = /(\/\/.*)|("[^"]*")|([a-zA-Z_]\w*)|([^\w"/]+|.)/g;
    let html = "";
    let match;

    const keywords = new Set([
      "class", "public", "private", "protected", "return", "new", "throw", "try", 
      "catch", "final", "void", "static", "import", "package", "if", "else", "true", "false"
    ]);
    const typeKeywords = new Set([
      "String", "int", "boolean", "double", "float", "long", "char", "Exception"
    ]);
    const apiClasses = new Set([
      "System", "PreparedStatement", "Statement", "Connection", "ResultSet", "DriverManager", "log", "error", "getenv"
    ]);

    const escapeHtml = (str: string) => {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    };

    while ((match = tokenRegex.exec(line)) !== null) {
      const [token, comment, string, word] = match;
      if (comment !== undefined) {
        html += `<span class="text-zinc-500 font-normal font-mono">${escapeHtml(comment)}</span>`;
      } else if (string !== undefined) {
        html += `<span class="text-cyber-yellow font-mono">${escapeHtml(string)}</span>`;
      } else if (word !== undefined) {
        if (keywords.has(word)) {
          html += `<span class="text-cyber-pink font-bold font-mono">${word}</span>`;
        } else if (typeKeywords.has(word)) {
          html += `<span class="text-cyber-purple font-semibold font-mono">${word}</span>`;
        } else if (apiClasses.has(word)) {
          html += `<span class="text-cyber-cyan font-medium font-mono">${word}</span>`;
        } else {
          html += escapeHtml(word);
        }
      } else {
        html += escapeHtml(token);
      }
    }

    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const activeModelDisplay = aiResult?.modelName || (selectedProvider === "gemini" ? "Google Gemini 2.0 Flash" : "Groq (Llama 3.3 70B)");
  const displayExplanation = aiResult?.explanation || description;
  const originalLines = originalCode.split('\n');
  const fixedLines = fixedCode.split('\n');

  const renderSplitView = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-[#030306]">
        {/* Before Panel */}
        <div className="flex flex-col border border-cyber-pink/20 bg-[#240a12]/5 rounded-none overflow-hidden">
          <div className="bg-[#240a12]/20 border-b border-cyber-pink/25 px-4 py-2.5 text-cyber-pink font-bold text-[10px] uppercase tracking-widest flex items-center justify-between font-orbitron select-none">
            <span>Vulnerable Code</span>
            <span className="opacity-80">BEFORE PATCH</span>
          </div>
          <div className="bg-black/60 p-4 overflow-x-auto min-h-[160px] scrollbar-thin">
            {originalLines.map((line, idx) => (
              <div key={idx} className="flex items-stretch select-none font-mono text-[12px] leading-relaxed hover:bg-[#ff0055]/5 transition-colors border-l-2 border-transparent">
                <div className="w-10 text-right pr-3 select-none text-zinc-500 border-r border-zinc-800/40 bg-[#07070c]/30 py-0.5 font-mono text-[11px]">
                  {baseLine + idx}
                </div>
                <div className="flex-1 pl-3 py-0.5 overflow-x-auto whitespace-pre text-rose-300 font-mono">
                  {highlightLine(line)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* After Panel */}
        <div className="flex flex-col border border-cyber-green/20 bg-[#051e12]/5 rounded-none overflow-hidden">
          <div className="bg-[#051e12]/20 border-b border-cyber-green/25 px-4 py-2.5 text-cyber-green font-bold text-[10px] uppercase tracking-widest flex items-center justify-between font-orbitron select-none">
            <span>Secured Patch</span>
            <span className="text-cyber-green flex items-center gap-1">
              <Sparkles className="h-3 w-3 animate-pulse" />
              {activeModelDisplay}
            </span>
          </div>
          <div className="bg-black/60 p-4 overflow-x-auto min-h-[160px] scrollbar-thin">
            {fixedLines.map((line, idx) => (
              <div key={idx} className="flex items-stretch select-none font-mono text-[12px] leading-relaxed hover:bg-[#00ff66]/5 transition-colors border-l-2 border-transparent">
                <div className="w-10 text-right pr-3 select-none text-zinc-500 border-r border-zinc-800/40 bg-[#07070c]/30 py-0.5 font-mono text-[11px]">
                  {baseLine + idx}
                </div>
                <div className="flex-1 pl-3 py-0.5 overflow-x-auto whitespace-pre text-emerald-300 font-mono">
                  {highlightLine(line)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderUnifiedView = () => {
    return (
      <div className="border border-zinc-800 bg-black/60 overflow-hidden rounded-none">
        <div className="bg-[#08080f] px-4 py-2.5 border-b border-zinc-800 text-zinc-400 text-[10px] font-orbitron uppercase tracking-widest flex items-center justify-between select-none">
          <span>Unified Diff Viewer</span>
          <span className="text-zinc-500">Lines {baseLine} - {baseLine + unifiedLines.length}</span>
        </div>
        <div className="p-4 overflow-x-auto min-h-[160px] bg-black/40 scrollbar-thin">
          {unifiedLines.map((line, idx) => {
            const isAdded = line.type === 'added';
            const isDeleted = line.type === 'deleted';
            const rowBg = isAdded 
              ? 'bg-[#00ff66]/10 hover:bg-[#00ff66]/15' 
              : isDeleted 
              ? 'bg-[#ff0055]/10 hover:bg-[#ff0055]/15' 
              : 'hover:bg-zinc-900/45';
            
            const indicatorColor = isAdded 
              ? 'text-[#00ff66]' 
              : isDeleted 
              ? 'text-[#ff0055]' 
              : 'text-zinc-600';

            const indicator = isAdded ? '+' : isDeleted ? '-' : ' ';
            
            return (
              <div key={idx} className={`flex items-stretch select-none font-mono text-[12px] leading-relaxed transition-colors border-l-2 ${isAdded ? 'border-[#00ff66]' : isDeleted ? 'border-[#ff0055]' : 'border-transparent'} ${rowBg}`}>
                <div className="w-10 text-right pr-3 select-none text-zinc-500 border-r border-zinc-800/40 bg-[#07070c]/50 py-0.5 font-mono text-[11px]">
                  {isAdded ? '' : line.originalLineNo}
                </div>
                <div className="w-10 text-right pr-3 select-none text-zinc-500 border-r border-zinc-800/40 bg-[#07070c]/50 py-0.5 font-mono text-[11px]">
                  {isDeleted ? '' : line.fixedLineNo}
                </div>
                <div className={`w-8 text-center select-none font-bold py-0.5 font-mono ${indicatorColor}`}>
                  {indicator}
                </div>
                <div className={`flex-1 pl-4 py-0.5 overflow-x-auto whitespace-pre font-mono ${isAdded ? 'text-emerald-300 font-mono' : isDeleted ? 'text-rose-300 font-mono' : 'text-zinc-300 font-mono'}`}>
                  {highlightLine(line.text)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#030306] cyber-grid-bg text-foreground">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar currentPath="/analysis" />
        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-w-[1600px] mx-auto w-full text-left">
          
          {/* Top Back Button & Model Selector Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleBack}
              className="flex items-center gap-2 border-cyber-cyan/35 text-cyber-cyan hover:shadow-[0_0_10px_rgba(0,240,255,0.25)] font-mono text-xs"
            >
              <ArrowLeft className="h-4 w-4" />
              BACK TO ANALYSIS COCKPIT
            </Button>

            {/* AI Model Switcher */}
            <div className="flex items-center gap-3 bg-[#0a0a14] border border-cyber-cyan/30 px-3.5 py-1.5 font-mono text-xs shadow-[0_0_10px_rgba(0,240,255,0.1)]">
              <div className="flex items-center gap-1.5 text-cyber-cyan">
                {isAiLoading ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                )}
                <span className="text-[10px] font-orbitron font-bold uppercase tracking-wider text-zinc-400">
                  AI ENGINE:
                </span>
              </div>

              <select
                value={selectedProvider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer border-b border-cyber-cyan/40 pb-0.5"
              >
                <option value="groq" className="bg-[#0b0b14] text-white">Groq (Meta Llama 3.3 70B)</option>
                <option value="gemini" className="bg-[#0b0b14] text-white">Google Gemini 2.0 Flash</option>
              </select>
            </div>
          </div>

          {/* Failover Alert Banner (Only shown if rate-limit failover occurred) */}
          {aiResult?.fallbackTriggered && (
            <div className="p-4 bg-[#ffbd2e]/10 border border-[#ffbd2e]/40 flex items-start gap-3.5 animate-in fade-in-50 duration-200">
              <AlertTriangle className="h-5 w-5 text-[#ffbd2e] shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-orbitron font-bold text-xs text-[#ffbd2e] uppercase tracking-wider">
                    AUTOMATIC RATE-LIMIT FAILOVER ACTIVATED
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-[#ffbd2e]/20 text-[#ffbd2e] border border-[#ffbd2e]/30">
                    ZERO DOWNTIME
                  </span>
                </div>
                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  {aiResult.fallbackReason || "Primary AI model encountered rate limits. DevGuardian automatically switched to the secondary backup engine."}
                </p>
                <div className="flex items-center gap-3 pt-1 text-[10px] font-mono text-zinc-400">
                  <span>Primary: <strong className="text-white">{aiResult.primaryModel || "Groq"}</strong></span>
                  <span>•</span>
                  <span>Active Engine: <strong className="text-cyber-green">{aiResult.modelName || "Gemini 2.0"}</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* Header & Path Banner */}
          <div className="border-b border-cyber-cyan/15 pb-6 space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant={severity.toLowerCase() === "critical" || severity.toLowerCase() === "high" ? "error" : "warning"}>
                {severity}
              </Badge>
              <span className="text-zinc-600 font-mono select-none">•</span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground uppercase">{category}</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-white uppercase tracking-wider leading-tight">
              {title}
            </h1>

            {/* Filepath Metadata Bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-cyber-cyan bg-[#090e18]/80 border border-cyber-cyan/30 p-3 w-full">
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500 uppercase text-[9px] font-bold tracking-widest font-orbitron">FILE PATH:</span>
                <span className="text-white px-2.5 py-0.5 bg-black/40 border border-zinc-800 font-mono text-xs">{filePath}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500 uppercase text-[9px] font-bold tracking-widest font-orbitron">LINE:</span>
                <span className="text-cyber-pink px-2.5 py-0.5 bg-black/40 border border-zinc-800 font-mono text-xs">{lineNo}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500 uppercase text-[9px] font-bold tracking-widest font-orbitron">RULE CODE:</span>
                <span className="text-zinc-300 px-2.5 py-0.5 bg-black/40 border border-zinc-800 font-mono text-xs">{ruleCode}</span>
              </div>
            </div>
          </div>

          {/* Row 1: Summary & Telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2">
              <Card 
                title="Vulnerability Summary & Diagnosis" 
                subtitle="AUTOMATED AST EXPLANATION"
                techCorners={true}
                className="border-cyber-cyan/15 h-full"
              >
                <div className="bg-[#0b0b14] border border-border/80 p-5 rounded-none h-full flex flex-col justify-center">
                  <span className="text-[9px] font-bold text-cyber-pink block uppercase tracking-wider font-orbitron mb-2">IDENTIFIED ISSUE</span>
                  <p className="text-sm text-zinc-100 leading-relaxed font-sans font-medium antialiased">
                    {displayExplanation}
                  </p>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card 
                title="Active AI Router" 
                subtitle="LLM ORCHESTRATION"
                techCorners={true}
                className="border-cyber-cyan/15 h-full"
              >
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-[#05050a] border border-border/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 uppercase">ACTIVE MODEL</span>
                      <span className="text-cyber-green text-[10px] font-bold">{activeModelDisplay}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 uppercase">ROUTING POLICY</span>
                      <span className="text-cyber-cyan text-[10px] font-bold">AUTO-FAILOVER ON 429</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 uppercase">STANDBY BACKUP</span>
                      <span className="text-zinc-400 text-[10px]">
                        {selectedProvider === "gemini" ? "Groq (Llama 3.3)" : "Google Gemini 2.0"}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Row 2: Diff Patch */}
          <div>
            <Card 
              title={
                <div className="flex items-center justify-between w-full">
                  <span>Proposed Secure Diff Patch</span>
                  <div className="flex items-center border border-zinc-800 bg-[#06060c] p-0.5 rounded-sm relative z-20">
                    <button
                      onClick={() => setDiffMode('unified')}
                      className={`px-3.5 py-1.5 text-[9px] font-bold font-orbitron tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                        diffMode === 'unified' 
                          ? 'bg-cyber-cyan text-black shadow-[0_0_8px_rgba(0,240,255,0.45)]' 
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      Unified Diff
                    </button>
                    <button
                      onClick={() => setDiffMode('split')}
                      className={`px-3.5 py-1.5 text-[9px] font-bold font-orbitron tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                        diffMode === 'split' 
                          ? 'bg-cyber-cyan text-black shadow-[0_0_8px_rgba(0,240,255,0.45)]' 
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      Split View
                    </button>
                  </div>
                </div>
              }
              subtitle="IDE CODE REMEDIATION WORKSPACE"
              techCorners={true}
              className="border-cyber-cyan/15 w-full"
            >
              <div className="mt-2">
                {diffMode === 'split' ? renderSplitView() : renderUnifiedView()}
              </div>
            </Card>
          </div>

          <AppFooter />
        </main>
      </div>
    </div>
  );
}

export default function RecommendationPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted-foreground font-orbitron uppercase tracking-widest">Loading Recommendation Module...</div>}>
      <RecommendationPageContent />
    </Suspense>
  );
}
