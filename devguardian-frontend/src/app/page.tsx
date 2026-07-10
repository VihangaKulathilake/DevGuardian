"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Terminal as TerminalIcon, 
  Code2, 
  Cpu, 
  Sparkles, 
  Play, 
  RefreshCw, 
  ShieldAlert, 
  Bug,
  Database
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useAppSelector } from "@/hooks/useRedux";

export default function LandingPage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  // Live Simulator States
  const [scanState, setScanState] = useState<"IDLE" | "CLONING" | "AUDITING" | "COMPILING" | "REMEDIATED">("IDLE");
  const [currentProgress, setCurrentProgress] = useState(0);
  const [score, setScore] = useState(100);
  const [detectedIssues, setDetectedIssues] = useState<Array<{ name: string; type: string; severity: "critical" | "high" | "medium" }>>([]);
  const [terminalLogs, setTerminalLogs] = useState<string[]>(["SYSTEM: Idle. Awaiting authorization sequence..."]);

  // Start dummy scan routine
  const triggerLiveScan = () => {
    if (scanState !== "IDLE" && scanState !== "REMEDIATED") return;
    
    setScanState("CLONING");
    setCurrentProgress(10);
    setScore(100);
    setDetectedIssues([]);
    setTerminalLogs([
      "SECURE: Connecting to repository core-auth-service...",
      "GIT: Fetching branch 'main'...",
      "GIT: Cloned 187 source files securely."
    ]);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (scanState === "CLONING") {
      interval = setInterval(() => {
        setCurrentProgress((p) => {
          if (p >= 35) {
            clearInterval(interval);
            setScanState("AUDITING");
            setTerminalLogs((prev) => [
              ...prev,
              "SCAN: Injecting static analyzer engines...",
              "SCAN: Running SQL_INJECTION_RULE...",
              "SCAN: Running HARDCODED_PASSWORD_RULE..."
            ]);
            return 35;
          }
          return p + 5;
        });
      }, 200);
    } else if (scanState === "AUDITING") {
      interval = setInterval(() => {
        setCurrentProgress((p) => {
          if (p >= 75) {
            clearInterval(interval);
            setScanState("COMPILING");
            setTerminalLogs((prev) => [
              ...prev,
              "WARNING: Vulnerability identified in RegisterRequest.java:L24",
              "WARNING: Weak hash format detected in DeepNestingRule.java:L48",
              "ANALYSIS: Score calculated at 68/100."
            ]);
            setScore(68);
            setDetectedIssues([
              { name: "SQL Injection in User Lookup", type: "Security Risk", severity: "critical" },
              { name: "Hardcoded Stripe AuthToken", type: "Key Leak", severity: "high" },
              { name: "Insecure JWT Signing Secret", type: "Compliance", severity: "high" }
            ]);
            return 75;
          }
          return p + 8;
        });
      }, 300);
    } else if (scanState === "COMPILING") {
      interval = setTimeout(() => {
        setScanState("REMEDIATED");
        setCurrentProgress(100);
        setScore(98);
        setTerminalLogs((prev) => [
          ...prev,
          "REMEDIATION: Triggering AI-assisted code patches...",
          "REMEDIATION: Patch applied successfully: replaced hardcoded secrets with environment properties.",
          "GIT: Secure branch PR created successfully. Auto-merge approved.",
          "SYSTEM: Security workspace verified. Net score updated to 98/100."
        ]);
        setDetectedIssues([]);
      }, 2500);
    }
    return () => {
      clearInterval(interval);
      clearTimeout(interval);
    };
  }, [scanState]);

  return (
    <div className="min-h-screen bg-[#05050a] text-foreground selection:bg-cyber-cyan/30 relative overflow-hidden flex flex-col justify-between cyber-grid-bg scanlines-overlay">
      {/* Background Neon Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] bg-cyber-cyan/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] bg-cyber-purple/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />

      {/* Futuristic Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between border-b border-cyber-cyan/15 backdrop-blur-md sticky top-0 z-50 bg-[#05050a]/65">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-sm bg-cyber-cyan text-black flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.4)]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="font-orbitron font-extrabold text-lg tracking-wider text-white">Dev<span className="text-cyber-cyan">Guardian</span></span>
        </div>
        <nav className="hidden sm:flex items-center gap-8 font-orbitron text-xs font-bold text-muted-foreground">
          <a href="#demo" className="hover:text-cyber-cyan hover:shadow-neon-cyan transition-all">TERMINAL SCAN</a>
          <a href="#features" className="hover:text-cyber-cyan hover:shadow-neon-cyan transition-all">SYSTEM FEATURES</a>
          <a href="/dashboard" className="hover:text-cyber-cyan hover:shadow-neon-cyan transition-all">DASHBOARD</a>
        </nav>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button variant="primary" size="sm" className="shadow-lg shadow-cyber-cyan/20">
                ENTER DASHBOARD
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="font-orbitron text-xs font-bold text-muted-foreground hover:text-white transition-colors">
                SIGN IN
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm" className="shadow-lg shadow-cyber-cyan/20">
                  LAUNCH CONSOLE
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Hero & Console Simulator */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-16 flex flex-col items-center justify-center text-center">
        
        {/* Sparkles Glowing Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border border-cyber-cyan/30 bg-cyber-cyan/5 text-[9px] font-bold text-cyber-cyan uppercase font-mono tracking-widest mb-6 animate-pulse shadow-[0_0_10px_rgba(0,240,255,0.1)]">
          <Sparkles className="h-3.5 w-3.5 text-cyber-cyan" />
          AI COCKPIT DEPLOYED // VERSION 2.6
        </div>
        
        <h1 className="max-w-4xl text-5xl sm:text-7xl font-orbitron font-black uppercase tracking-tight text-white mb-6 leading-[1.05]">
          SECURE REPOSITORIES <br />
          <span className="bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-pink bg-clip-text text-transparent filter drop-shadow-[0_0_10px_rgba(0,240,255,0.15)]">
            WITH AUTONOMOUS AI
          </span>
        </h1>
        
        <p className="max-w-2xl text-xs sm:text-sm text-muted-foreground font-mono leading-relaxed mb-10 uppercase tracking-wide">
          &gt; Continuous threat intelligence, automated code repairs, and developer compliance logs. Managed by Google Gemini.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20 w-full sm:w-auto">
          {isAuthenticated ? (
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" variant="cyber" className="w-full group">
                ENTER SECURITY CONSOLE
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" variant="cyber" className="w-full group">
                  START FREE TRIAL
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full">
                  ENTER SYSTEM DEMO
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* INTERACTIVE DEMO CONSOLE */}
        <div id="demo" className="w-full max-w-5xl glow-card-flow p-[1.5px] shadow-2xl relative mb-24 cyber-card-clip">
          <div className="absolute inset-0 bg-cyber-cyan/5 pointer-events-none" />
          
          <div className="bg-[#050508] p-5 flex flex-col md:flex-row gap-5 text-left relative overflow-hidden z-10">
            {/* Cyber Dotted Matrix Overlay */}
            <div className="absolute inset-0 cyber-grid-dot opacity-20 pointer-events-none" />
            <div className="absolute top-2 right-4 font-mono text-[8px] text-cyber-cyan/35 tracking-widest select-none uppercase font-bold">DEVGUARDIAN CORE // SIM_V2</div>
            
            {/* Corner Notch Decal */}
            <div className="tech-corner-accent" />
            
            {/* Console Left sidebar: Live stats info */}
            <div className="md:w-1/3 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border/80 pb-4 md:pb-0 md:pr-5 relative z-20">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <span className="text-[10px] font-bold font-orbitron text-white tracking-widest uppercase">AUDIT MATRIX</span>
                  <Badge variant={score > 90 ? "success" : "error"}>{score}/100 Score</Badge>
                </div>
                
                {/* Live parameters */}
                <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                  <div className="bg-[#0b0b14] border border-border p-2">
                    <span className="text-muted-foreground block uppercase text-[8px]">SCAN OBJECTS</span>
                    <span className="text-white font-bold text-xs">187 Files</span>
                  </div>
                  <div className="bg-[#0b0b14] border border-border p-2">
                    <span className="text-muted-foreground block uppercase text-[8px]">THREAT ENGINE</span>
                    <span className="text-cyber-cyan font-bold text-xs">Gemini Pro</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[8px] font-mono uppercase text-muted-foreground">
                    <span>SECURITY COCKPIT RUNNING</span>
                    <span className="text-cyber-cyan font-bold">{currentProgress}%</span>
                  </div>
                  <div className="w-full h-1 bg-[#10101f] rounded-none overflow-hidden relative border border-border/40">
                    <div 
                      className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-purple transition-all duration-300 shadow-[0_0_8px_rgba(0,240,255,0.6)]" 
                      style={{ width: `${currentProgress}%` }}
                    />
                  </div>
                </div>

                {/* Live Issues display panel */}
                <div className="space-y-2">
                  <span className="text-[8px] font-bold font-orbitron text-muted-foreground tracking-wider uppercase block">THREATS IDENTIFIED ({detectedIssues.length})</span>
                  <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1">
                    {detectedIssues.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-border/50 text-[9px] font-mono text-muted-foreground uppercase">
                        {scanState === "REMEDIATED" ? "All vulnerabilities auto-patched!" : "No active threats detected."}
                      </div>
                    ) : (
                      detectedIssues.map((issue, idx) => (
                        <div key={idx} className="p-2 border border-cyber-pink/20 bg-cyber-pink/5 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-white font-bold text-[9px] block truncate">{issue.name}</span>
                            <span className="text-muted-foreground text-[8px] block uppercase font-mono">{issue.type}</span>
                          </div>
                          <Badge variant="error" className="scale-75 origin-right">{issue.severity}</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Action Trigger Button */}
              <div className="pt-4 border-t border-border/60 mt-4 md:mt-0">
                <Button 
                  onClick={triggerLiveScan}
                  disabled={scanState !== "IDLE" && scanState !== "REMEDIATED"}
                  variant={scanState === "IDLE" || scanState === "REMEDIATED" ? "primary" : "secondary"}
                  size="sm"
                  className="w-full text-center"
                >
                  {scanState === "IDLE" ? (
                    <>
                      <Play className="h-3.5 w-3.5 mr-1.5" />
                      RUN LIVE SECURITY SCAN
                    </>
                  ) : scanState === "REMEDIATED" ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      SIMULATE AGAIN
                    </>
                  ) : (
                    "SCAN SEQUENCE RUNNING..."
                  )}
                </Button>
              </div>
            </div>

            {/* Console Right Panel: Code audit shell logs */}
            <div className="flex-1 flex flex-col bg-[#020205]/95 border border-cyber-cyan/15 p-4 rounded-none h-80 font-mono text-[10px] leading-relaxed relative overflow-hidden z-20">
              {/* Laser sweep animation when scanning */}
              {(scanState === "CLONING" || scanState === "AUDITING" || scanState === "COMPILING") && (
                <div className="laser-scan-line" />
              )}
              
              <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-cyber-pink animate-pulse" />
                  <span className="text-white font-bold text-[9px] uppercase tracking-wider font-orbitron">DEVGUARDIAN SHELL</span>
                </div>
                <span className="text-muted-foreground text-[8px] uppercase">SYS_AUDIT_LOG</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 flex flex-col-reverse justify-end">
                {[...terminalLogs].reverse().map((log, idx) => {
                  let logColor = "text-zinc-400";
                  if (log.startsWith("WARNING:")) logColor = "text-cyber-pink font-bold";
                  else if (log.startsWith("REMEDIATION:") || log.includes("PR created")) logColor = "text-cyber-green font-bold";
                  else if (log.startsWith("SYSTEM:") || log.includes("net score")) logColor = "text-cyber-cyan font-bold";
                  return (
                    <div key={idx} className="flex gap-2">
                      <span className="text-border/60 select-none">&gt;&gt;</span>
                      <span className={logColor}>{log}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-12 w-full text-left">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-orbitron font-extrabold text-white mb-4 uppercase tracking-wider">
              CYBERNETIC GUARD PROTOCOLS
            </h2>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
              Complete automated architecture, threat monitoring, and code patching engines.
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:border-cyber-cyan/40 transition-all duration-300">
              <Zap className="h-8 w-8 text-cyber-cyan mb-4" />
              <h3 className="text-sm font-bold font-orbitron text-white uppercase tracking-wider mb-2">PR Auto-Scans</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Seamless git triggers monitor pull requests in real time for configuration drift, static bugs, and architectural deep nesting.
              </p>
            </Card>
            
            <Card className="hover:border-cyber-purple/40 transition-all duration-300">
              <Cpu className="h-8 w-8 text-cyber-purple mb-4" />
              <h3 className="text-sm font-bold font-orbitron text-white uppercase tracking-wider mb-2">Gemini Pro Auto-Fix</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Patches vulnerabilities automatically. Generates precise code modifications and drafts PRs with remediation layouts instantly.
              </p>
            </Card>
            
            <Card className="hover:border-cyber-pink/40 transition-all duration-300">
              <ShieldAlert className="h-8 w-8 text-cyber-pink mb-4" />
              <h3 className="text-sm font-bold font-orbitron text-white uppercase tracking-wider mb-2">Deep Static Audit</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Checks codebases against security guidelines (OWASP, credentials check, insecure HTTP configurations) with high accuracy.
              </p>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-8 border-t border-border/30 text-center font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
        <p>© 2026 DevGuardian Inc. All security terminals active.</p>
      </footer>
    </div>
  );
}
