"use client";

import * as React from "react";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/navbar/Sidebar";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Shield, BookOpen, Key, GitBranch, Cpu, Radio, Sparkles, Upload, Link2, GitFork, CheckCircle2 } from "lucide-react";
import AppFooter from "@/components/common/AppFooter";

export default function SupportPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#030306] cyber-grid-bg text-foreground">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar currentPath="/support" />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full space-y-8">
          
          {/* Header */}
          <div className="border-b border-cyber-cyan/15 pb-6 text-left">
            <h1 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-white uppercase tracking-wider mb-2 leading-none">
              DOCUMENTATION & PLATFORM GUIDE
            </h1>
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
              Explore DevGuardian's multi-language AST engine, OWASP rulesets, and AI remediation workflows.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 items-start">
            
            {/* Left & Middle Column (Docs Content) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Codebase Linking Methods */}
              <Card
                title={
                  <div className="flex items-center gap-2.5">
                    <GitFork className="h-4.5 w-4.5 text-cyber-cyan" />
                    <span>Codebase Ingestion Protocols</span>
                  </div>
                }
                subtitle="Three flexible ways to link and audit projects in DevGuardian."
                techCorners={true}
                className="border-cyber-cyan/15"
              >
                <div className="grid gap-4 mt-2 text-left font-sans">
                  <div className="p-4 bg-[#0b0b14]/90 border border-zinc-800 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <GitFork className="h-4 w-4 text-cyber-purple" />
                      <span className="font-orbitron font-bold text-xs text-white uppercase tracking-wider">
                        1. GitHub OAuth Integration
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Authenticate with GitHub to view and import your public and private repositories in one click. Webhook triggers and automated commit audits are handled automatically.
                    </p>
                  </div>

                  <div className="p-4 bg-[#0b0b14]/90 border border-zinc-800 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-cyber-cyan" />
                      <span className="font-orbitron font-bold text-xs text-white uppercase tracking-wider">
                        2. Remote Git Clone URLs
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Provide any public Git URL or user-authenticated private repository endpoint. DevGuardian automatically queries remote branches and executes shallow sandboxed clones.
                    </p>
                  </div>

                  <div className="p-4 bg-[#0b0b14]/90 border border-zinc-800 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-cyber-green" />
                      <span className="font-orbitron font-bold text-xs text-white uppercase tracking-wider">
                        3. Sandboxed ZIP Archive Upload
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Upload project archives directly from your machine. Files are unpacked inside a secure isolated storage enclave on the server, requiring no network Git credentials.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Supported OWASP Rulesets */}
              <Card
                title={
                  <div className="flex items-center gap-2.5">
                    <Shield className="h-4.5 w-4.5 text-cyber-cyan" />
                    <span>Multi-Language OWASP Rule Engine</span>
                  </div>
                }
                subtitle="Static AST vulnerability detection across JavaScript, TypeScript, and Java."
                techCorners={true}
                className="border-cyber-cyan/15"
              >
                <div className="grid gap-3 sm:grid-cols-2 mt-2 text-left font-mono text-xs">
                  <div className="p-3 bg-[#050509] border border-zinc-800/80 space-y-1">
                    <span className="text-cyber-pink font-bold block">// SQL Injection (A03:2021)</span>
                    <p className="text-[11px] text-zinc-400 font-sans">Detects unparameterized string concatenations and template literals in DB queries.</p>
                  </div>
                  <div className="p-3 bg-[#050509] border border-zinc-800/80 space-y-1">
                    <span className="text-cyber-pink font-bold block">// Command Injection (A03:2021)</span>
                    <p className="text-[11px] text-zinc-400 font-sans">Flags unsanitized inputs passed to child_process exec/spawn and Runtime.exec.</p>
                  </div>
                  <div className="p-3 bg-[#050509] border border-zinc-800/80 space-y-1">
                    <span className="text-cyber-pink font-bold block">// Path Traversal (A01:2021)</span>
                    <p className="text-[11px] text-zinc-400 font-sans">Detects dynamic file lookups that may expose restricted server files.</p>
                  </div>
                  <div className="p-3 bg-[#050509] border border-zinc-800/80 space-y-1">
                    <span className="text-cyber-pink font-bold block">// Cross-Site Scripting (A03:2021)</span>
                    <p className="text-[11px] text-zinc-400 font-sans">Identifies unsafe DOM sinks like innerHTML, dangerouslySetInnerHTML, and eval.</p>
                  </div>
                  <div className="p-3 bg-[#050509] border border-zinc-800/80 space-y-1">
                    <span className="text-cyber-yellow font-bold block">// Hardcoded Credentials (A07:2021)</span>
                    <p className="text-[11px] text-zinc-400 font-sans">Catches hardcoded passwords, tokens, API keys, and insecure default secrets.</p>
                  </div>
                  <div className="p-3 bg-[#050509] border border-zinc-800/80 space-y-1">
                    <span className="text-cyber-yellow font-bold block">// Weak Cryptography (A02:2021)</span>
                    <p className="text-[11px] text-zinc-400 font-sans">Flags deprecated cryptographic algorithms like MD5, SHA-1, DES, and RC4.</p>
                  </div>
                </div>
              </Card>

            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              
              {/* AI Remediation Card */}
              <Card
                title="AI Remediation Core"
                subtitle="GEMINI 2.5 FLASH ENGINE"
                techCorners={true}
                className="border-cyber-purple/20"
              >
                <div className="space-y-4 text-xs text-left font-sans">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 border border-cyber-purple bg-cyber-purple/10 text-cyber-purple flex items-center justify-center shrink-0 shadow-[0_0_10px_#8f00ff30]">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <span className="font-orbitron font-bold text-xs text-white uppercase tracking-wider block">
                        Dynamic Code Patches
                      </span>
                      <p className="text-zinc-400 text-[11px] leading-relaxed">
                        Every flagged vulnerability can be inspected in the interactive diff viewer to generate side-by-side, production-ready remediation code.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-black/40 border border-zinc-800 space-y-1.5 font-mono text-[11px]">
                    <div className="text-cyber-green flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>AST-AWARE REPAIR ENGINE</span>
                    </div>
                    <p className="text-zinc-400 text-[10px] font-sans">
                      Suggests parameterized queries, secure environment variables, and safe error handling tailored to the detected language.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Service Status Telemetry */}
              <Card
                title="System Telemetry"
                subtitle="BACKEND NODES"
                techCorners={true}
                className="border-cyber-cyan/15"
              >
                <div className="space-y-3 font-mono text-xs text-left mt-2">
                  <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                    <span className="text-zinc-400 uppercase font-semibold flex items-center gap-2">
                      <Cpu className="h-3.5 w-3.5 text-cyber-cyan" />
                      Analysis Engine
                    </span>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                    <span className="text-zinc-400 uppercase font-semibold flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-cyber-purple" />
                      Gemini AI Core
                    </span>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-zinc-400 uppercase font-semibold flex items-center gap-2">
                      <Radio className="h-3.5 w-3.5 text-cyber-green" />
                      WebSocket Stream
                    </span>
                    <Badge variant="success">Connected</Badge>
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
