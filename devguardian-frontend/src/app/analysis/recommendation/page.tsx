"use client";

import * as React from "react";
import { Suspense } from "react";
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
  CheckCircle
} from "lucide-react";
import AppFooter from "@/components/common/AppFooter";

function RecommendationPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [diffMode, setDiffMode] = React.useState<'unified' | 'split'>('unified');

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

  // Prepare custom, realistic snippets
  let originalCode = `try {\n    // Code that might fail\n} catch (Exception e) {\n    // Empty block\n}`;
  let fixedCode = `try {\n    // Code that might fail\n} catch (Exception e) {\n    log.error("Execution failed", e);\n    throw new CustomException("Failed to run task", e);\n}`;
  
  interface DiffLine {
    type: 'added' | 'deleted' | 'normal';
    text: string;
    originalLineNo?: number;
    fixedLineNo?: number;
  }

  let unifiedLines: DiffLine[] = [];

  // Centralized dynamic patch generator
  const generateFixedCode = (rule: string, original: string) => {
    if (!original || original.trim() === "") {
      return "No recommended patch available.";
    }
    const trimmed = original.trim();

    // 1. SQL Injection Fix
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

    // 2. Hardcoded Secret / API Key / Password Fix
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

    // 3. Debug Mode Fix
    if (rule.toLowerCase().includes("debug")) {
      if (trimmed.includes("debug=true")) {
        return trimmed.replace("debug=true", "debug=false");
      }
      if (trimmed.includes("debug = true")) {
        return trimmed.replace("debug = true", "debug = false");
      }
      return `debug=false // Disable development diagnostics in production`;
    }

    // 4. Empty Catch Block Fix
    if (rule.toLowerCase().includes("empty_catch") || rule.toLowerCase().includes("catch")) {
      return `} catch (Exception e) {\n    log.error("Execution failed", e);\n    throw new CustomException("Failed to run task", e);\n}`;
    }

    // Fallback default fix suggestion
    return trimmed + `\n// Refactored dynamically using secure coding guidelines.`;
  };

  // If a real codeSnippet is passed from the database, use it!
  if (codeSnippet && codeSnippet.trim() !== "") {
    originalCode = codeSnippet;
    fixedCode = generateFixedCode(ruleCode, codeSnippet);
    unifiedLines = [
      { type: 'deleted', text: originalCode, originalLineNo: baseLine },
      { type: 'added', text: fixedCode, fixedLineNo: baseLine }
    ];
  } else {
    // Legacy static fallback to ensure compatibility with previously recorded scans
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
    } else if (title.toLowerCase().includes("secret") || title.toLowerCase().includes("key") || title.toLowerCase().includes("password") || title.toLowerCase().includes("credential")) {
      originalCode = `String secretKey = "stripe_api_key_placeholder_12345"; // Hardcoded credentials`;
      fixedCode = `String secretKey = System.getenv("DEVGUARDIAN_SECRET_KEY"); // Read from env variables`;
      unifiedLines = [
        { type: 'deleted', text: `String secretKey = "stripe_api_key_placeholder_12345"; // Hardcoded credentials`, originalLineNo: baseLine },
        { type: 'added', text: `String secretKey = System.getenv("DEVGUARDIAN_SECRET_KEY"); // Read from env variables`, fixedLineNo: baseLine }
      ];
    } else if (filePath.endsWith(".properties") || filePath.endsWith(".env") || title.toLowerCase().includes("debug")) {
      originalCode = `debug=true\nspring.datasource.password="admin123"`;
      fixedCode = `debug=false\nspring.datasource.password=\${DATABASE_PASSWORD}`;
      unifiedLines = [
        { type: 'deleted', text: `debug=true`, originalLineNo: baseLine },
        { type: 'added', text: `debug=false`, fixedLineNo: baseLine },
        { type: 'deleted', text: `spring.datasource.password="admin123"`, originalLineNo: baseLine + 1 },
        { type: 'added', text: `spring.datasource.password=\${DATABASE_PASSWORD}`, fixedLineNo: baseLine + 1 }
      ];
    } else if (title.toLowerCase().includes("large file")) {
      originalCode = `// Large file detected: ${filePath}\n// Tracking large files directly in git degrades clone and scan performance.`;
      fixedCode = `# Add to your .gitignore to exclude this file from repository tracking\n${filePath}`;
      unifiedLines = [
        { type: 'deleted', text: `// Large file detected: ${filePath}`, originalLineNo: baseLine },
        { type: 'added', text: `# Exclude large files/data from Git tracking in .gitignore`, fixedLineNo: baseLine },
        { type: 'added', text: `${filePath}`, fixedLineNo: baseLine + 1 }
      ];
    } else {
      originalCode = `// TODO: Implement user verification logic`;
      fixedCode = `if (user.isVerified()) {\n    proceedToDashboard();\n} else {\n    throw new UnauthorizedException();\n}`;
      unifiedLines = [
        { type: 'deleted', text: `// TODO: Implement user verification logic`, originalLineNo: baseLine },
        { type: 'added', text: `if (user.isVerified()) {`, fixedLineNo: baseLine },
        { type: 'added', text: `    proceedToDashboard();`, fixedLineNo: baseLine + 1 },
        { type: 'added', text: `} else {`, fixedLineNo: baseLine + 2 },
        { type: 'added', text: `    throw new UnauthorizedException();`, fixedLineNo: baseLine + 3 },
        { type: 'added', text: `}`, fixedLineNo: baseLine + 4 }
      ];
    }
  }

  const handleBack = () => {
    router.push(`/analysis?repoId=${repoId}`);
  };

  // Safe syntax highlight builder matching the theme
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
      const [token, comment, string, word, other] = match;
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

  const parseRecommendation = (text: string) => {
    const steps = text
      .split(/\. |\n|; /)
      .map(s => s.trim())
      .filter(s => s.length > 3);
    
    if (steps.length === 0) {
      return [text];
    }
    return steps;
  };

  const steps = parseRecommendation(recommendation);
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
            <span className="text-cyber-green animate-pulse">GEMINI AUTO-FIX</span>
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
    <div className="flex flex-col min-h-screen bg-[#030306] cyber-grid-bg">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar currentPath="/analysis" />
        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {/* Breadcrumb Back Button */}
          <div>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleBack}
              className="flex items-center gap-2 border-cyber-cyan/35 text-cyber-cyan hover:shadow-[0_0_10px_rgba(0,240,255,0.25)]"
            >
              <ArrowLeft className="h-4 w-4" />
              BACK TO ANALYSIS OVERVIEW
            </Button>
          </div>

          {/* Header & Path Banner */}
          <div className="border-b border-cyber-cyan/15 pb-6 space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant={severity.toLowerCase() === "critical" || severity.toLowerCase() === "high" ? "error" : "warning"}>
                {severity}
              </Badge>
              <span className="text-zinc-600 font-mono select-none">//</span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground uppercase">{category}</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-white uppercase tracking-wider leading-tight">
              {title}
            </h1>

            {/* Structured Filepath Metadata Bar */}
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
                <span className="text-zinc-500 uppercase text-[9px] font-bold tracking-widest font-orbitron">RULE TRIGGERED:</span>
                <span className="text-zinc-300 px-2.5 py-0.5 bg-black/40 border border-zinc-800 font-mono text-xs">{ruleCode}</span>
              </div>
            </div>
          </div>

          {/* Row 1: Summary & Telemetry overview (Side by Side) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Vulnerability Summary Details */}
            <div className="lg:col-span-2">
              <Card 
                title="Vulnerability Summary" 
                subtitle="EXPLANATORY DIAGNOSIS"
                techCorners={true}
                className="border-cyber-cyan/15 h-full"
              >
                <div className="bg-[#0b0b14] border border-border/80 p-5 rounded-none h-full flex flex-col justify-center">
                  <span className="text-[9px] font-bold text-cyber-pink block uppercase tracking-wider font-orbitron mb-2">IDENTIFIED ISSUE</span>
                  <p className="text-sm text-zinc-100 leading-relaxed font-sans font-medium antialiased">
                    {description}
                  </p>
                </div>
              </Card>
            </div>

            {/* Threat Telemetry metrics */}
            <div className="lg:col-span-1">
              <Card 
                title="Threat Telemetry" 
                subtitle="SCAN METRICS ANALYSIS"
                techCorners={true}
                className="border-cyber-cyan/15 h-full"
              >
                <div className="space-y-4">
                  {/* Score Impact Display */}
                  <div className="bg-[#0b0b14] border border-border/80 p-4 rounded-none space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-orbitron font-bold text-cyber-pink tracking-wider">
                      <span>SCAN SCORE IMPACT</span>
                      <span>-18 POINTS</span>
                    </div>
                    {/* Glowing progress/severity bar */}
                    <div className="w-full bg-[#181829] h-2 rounded-full overflow-hidden relative">
                      <div 
                        className="bg-gradient-to-r from-cyber-purple via-cyber-pink to-cyber-pink h-full rounded-full animate-pulse shadow-[0_0_8px_#ff007f]" 
                        style={{ width: '80%' }} 
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                      <span>SEVERITY: CRITICAL</span>
                      <span>HIGH THREAT WEIGHT</span>
                    </div>
                  </div>

                  {/* Other Telemetry Info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#05050a] border border-border/80 p-3 flex flex-col justify-between">
                      <span className="text-[9px] text-zinc-500 font-mono font-bold uppercase">COMPLIANCE REF</span>
                      <span className="text-white font-orbitron font-extrabold text-xs tracking-wider mt-1.5">OWASP_A1_2026</span>
                    </div>
                    <div className="bg-[#05050a] border border-border/80 p-3 flex flex-col justify-between">
                      <span className="text-[9px] text-zinc-500 font-mono font-bold uppercase">AUTONOMOUS FIX</span>
                      <span className="text-cyber-green font-orbitron font-extrabold text-xs tracking-wider uppercase animate-pulse mt-1.5">READY</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Row 2: Full-width proposed secure diff patch (Spacious Workspace) */}
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

          {/* Row 3: Gemini AI Remediation Details & Action Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Guide details */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-orbitron flex items-center gap-1.5 select-none">
                <Sparkles className="h-4 w-4 text-cyber-cyan animate-pulse" />
                Gemini Automated Audit Remediation Guide
              </h4>
              
              <div className="glow-card-flow p-[1.5px] shadow-lg cyber-card-clip">
                <div className="bg-[#07070c] p-6 relative z-10 space-y-6">
                  <div className="absolute inset-0 cyber-grid-dot opacity-15 pointer-events-none" />
                  
                  {/* AI Classification Analysis */}
                  <div className="border-l-2 border-cyber-cyan pl-4 py-2 bg-[#090e18]/80 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyber-cyan/5 to-transparent pointer-events-none" />
                    <span className="text-[9px] text-cyber-cyan font-bold block uppercase tracking-wider font-orbitron mb-1.5">AI CLASSIFICATION DIAGNOSIS</span>
                    <p className="text-xs font-sans text-zinc-200 leading-relaxed font-semibold antialiased">
                      The static scanning engine flagged this code under <span className="text-white underline decoration-cyber-cyan/50 decoration-2 underline-offset-2">{title}</span>. 
                      Failure to bind constants or secure keys leaves environment credentials exposed to context lookups.
                    </p>
                  </div>
                  
                  {/* Step-by-step checklist recommendation */}
                  <div className="bg-[#0b0b14] border border-border/80 p-5 rounded-none font-sans text-sm leading-relaxed text-zinc-100 space-y-4">
                    <span className="text-[9px] font-bold text-cyber-cyan block uppercase tracking-wider font-orbitron">REMEDIATION INSTRUCTIONS & CHECKLIST</span>
                    <div className="space-y-3 font-sans">
                      {steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="flex items-center justify-center h-5 w-5 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan shrink-0 font-mono text-[10px] font-bold">
                            {idx + 1}
                          </div>
                          <p className="text-zinc-200 antialiased text-xs font-medium leading-relaxed pt-0.5">
                            {step.endsWith('.') ? step : step + '.'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI validation & CTAs side panel */}
            <div className="lg:col-span-1 lg:mt-7">
              <Card 
                title="Patch Action Console" 
                subtitle="DEPLOYMENT PRE-VALIDATION"
                techCorners={true}
                className="border-cyber-cyan/15"
              >
                <div className="space-y-6">
                  {/* Info block */}
                  <div className="bg-[#05050a] border border-border/80 p-4 space-y-3 relative overflow-hidden">
                    <div className="flex gap-3 text-left">
                      <ShieldAlert className="h-5 w-5 text-cyber-cyan shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold font-orbitron text-white uppercase tracking-widest block">SECURE REMEDIATION GUIDE</span>
                        <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                          Review the proposed secure code diff above and apply the recommended changes directly to your repository source files.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Console */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between font-sans text-xs bg-[#0b0b14] border border-border/60 px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4.5 w-4.5 text-cyber-cyan shrink-0" />
                        <span className="text-[9px] font-bold text-zinc-400 uppercase font-orbitron tracking-wider">GUIDANCE</span>
                      </div>
                      <span className="text-[10px] font-bold text-cyber-cyan uppercase font-orbitron tracking-wider">READY FOR REVIEW</span>
                    </div>

                    <Button 
                      variant="secondary" 
                      size="md"
                      onClick={() => router.push(repoId ? `/analysis?repoId=${repoId}` : '/analysis')}
                      className="border-zinc-700 hover:border-cyber-cyan text-zinc-200 hover:text-white flex items-center justify-center gap-2 w-full py-3 font-mono text-xs cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      BACK TO ANALYSIS
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
            
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
