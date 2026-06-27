"use client";

import * as React from "react";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/navbar/Sidebar";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Terminal, Shield, BookOpen, Key, GitBranch, MessageSquare, ExternalLink, Cpu } from "lucide-react";

export default function SupportPage() {
  const terminalLines = [
    { isComment: true, text: "# Install the DevGuardian static scanning engine globally" },
    { isComment: false, text: "npm install -g @devguardian/cli" },
    { isComment: true, text: "# Authenticate your machine using workspace access token" },
    { isComment: false, text: "devguardian auth --token dg_live_83a1f9e2d3b45a6c7e8f90a1b2c3d4e5" },
    { isComment: true, text: "# Run security threat analysis on local directory src" },
    { isComment: false, text: "devguardian scan --path ./src" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#030306] cyber-grid-bg text-foreground">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar currentPath="/support" />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full space-y-8">
          
          {/* Header */}
          <div className="border-b border-cyber-cyan/15 pb-6">
            <h1 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-white uppercase tracking-wider mb-2 leading-none">
              SUPPORT & COMMAND CENTER
            </h1>
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
              Review command line guides, scanning documentation, and operational help nodes.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 items-start">
            
            {/* Left & Middle Column (Docs Content) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* CLI Integration Guide (Mockup Terminal) */}
              <Card
                title={
                  <div className="flex items-center gap-2.5">
                    <Terminal className="h-4.5 w-4.5 text-cyber-cyan" />
                    <span>CLI & Build Integration</span>
                  </div>
                }
                subtitle="Execute security scanning inside local machines or CI pipelines."
                techCorners={true}
                className="border-cyber-cyan/15"
              >
                <div className="space-y-4 mt-2">
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed text-left">
                    Run the DevGuardian static analysis scans locally or bind them to active build servers (such as GitHub Actions or GitLab runners). Collect credentials inside the <a href="/settings" className="text-cyber-cyan hover:underline font-bold font-mono uppercase">Settings</a> workspace.
                  </p>
                  
                  {/* UNIX Terminal Mockup */}
                  <div className="border border-zinc-800 bg-[#050508] shadow-[0_0_20px_rgba(0,0,0,0.4)] rounded-none overflow-hidden select-all">
                    {/* Terminal Title Bar */}
                    <div className="bg-[#0c0c14] border-b border-zinc-800 px-4 py-2 flex items-center justify-between select-none">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                        <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                        <div className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-zinc-500 tracking-wider">
                        devguardian@terminal: ~
                      </span>
                      <div className="w-10" />
                    </div>

                    {/* Terminal body */}
                    <div className="p-4 font-mono text-[11px] leading-relaxed text-zinc-300 min-h-[140px] space-y-2 bg-[#050509] text-left">
                      {terminalLines.map((line, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          {/* Line numbers gutter */}
                          <span className="text-zinc-600 w-5 text-right select-none font-mono text-[10px] pt-[1.5px]">
                            {idx + 1}
                          </span>
                          
                          {line.isComment ? (
                            <span className="text-zinc-500 font-mono italic">
                              {line.text}
                            </span>
                          ) : (
                            <div className="flex-1 font-mono text-zinc-200">
                              <span className="text-cyber-cyan font-mono mr-2 select-none">$</span>
                              {/* Simple command coloring */}
                              {line.text.split(" ").map((token, tIdx) => {
                                const isCmd = tIdx === 0;
                                const isFlag = token.startsWith("-");
                                return (
                                  <span 
                                    key={tIdx} 
                                    className={`${isCmd ? 'text-cyber-pink font-bold font-mono' : isFlag ? 'text-cyber-yellow font-mono' : 'text-zinc-200 font-mono'} mr-1.5`}
                                  >
                                    {token}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Compatible badge list */}
                  <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                    <span className="text-zinc-500 font-mono text-[10px] font-bold uppercase tracking-wider">COMPATIBLE INTEGRATIONS:</span>
                    <Badge variant="neutral">GitHub Actions</Badge>
                    <Badge variant="neutral">GitLab Runners</Badge>
                    <Badge variant="neutral">CircleCI Config</Badge>
                  </div>
                </div>
              </Card>

              {/* Documentation guides */}
              <Card
                title={
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="h-4.5 w-4.5 text-cyber-cyan" />
                    <span>Getting Started Guides</span>
                  </div>
                }
                subtitle="Primary guidelines governing automated security workflows."
                techCorners={true}
                className="border-cyber-cyan/15"
              >
                <div className="grid gap-6 mt-2 text-left">
                  {/* Guide Node 1 */}
                  <div className="border-l-2 border-cyber-green bg-[#051e12]/5 pl-4 py-3 relative overflow-hidden group">
                    <h4 className="font-orbitron font-extrabold text-xs text-white uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-cyber-green animate-pulse" />
                      1. Security Auditing & OWASP Rulesets
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans font-medium">
                      DevGuardian checks targets for hardcoded secrets, SQL injections, insecure resource calls, and configurations. System scores range from A down to F reflecting overall vulnerabilities found.
                    </p>
                  </div>

                  {/* Guide Node 2 */}
                  <div className="border-l-2 border-cyber-cyan bg-[#090e18]/5 pl-4 py-3 relative overflow-hidden group">
                    <h4 className="font-orbitron font-extrabold text-xs text-white uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <GitBranch className="h-4 w-4 text-cyber-cyan animate-pulse" />
                      2. Automated Pull Request Scans
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans font-medium">
                      On connecting webhook configurations, DevGuardian automatically audits active changes made across commit branches, presenting security reports directly inside pull request timelines.
                    </p>
                  </div>

                  {/* Guide Node 3 */}
                  <div className="border-l-2 border-cyber-purple bg-[#120a1c]/5 pl-4 py-3 relative overflow-hidden group">
                    <h4 className="font-orbitron font-extrabold text-xs text-white uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Key className="h-4 w-4 text-cyber-purple animate-pulse" />
                      3. Automated Gemini Diff Patches
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans font-medium">
                      When vulnerability scans flag source codes, the Gemini engine structures side-by-side patch layouts. Selecting apply builds and merges the secure codes directly back to repositories.
                    </p>
                  </div>
                </div>
              </Card>

            </div>

            {/* Right Column (Help details & Server Status) */}
            <div className="flex flex-col gap-6">
              
              {/* Need help card */}
              <Card
                title="Workspace Help"
                subtitle="TECHNICAL COMMUNICATIONS"
                techCorners={true}
                className="border-cyber-pink/15"
              >
                <div className="space-y-4 text-xs text-left">
                  <p className="text-zinc-400 leading-relaxed font-sans">
                    Have questions regarding scan exceptions, false positive markers, or self-hosted deployment setups? Security engineers are available.
                  </p>

                  <div className="space-y-4 pt-1">
                    <div className="flex items-start gap-3 border-b border-border/40 pb-3">
                      <MessageSquare className="h-4.5 w-4.5 text-cyber-cyan shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-orbitron font-bold text-xs text-white uppercase tracking-wider">Live Security Chat</span>
                        <span className="text-[10px] text-zinc-500 font-mono">SYS RESPONSE TIME: &lt; 5 MINUTES</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Shield className="h-4.5 w-4.5 text-cyber-cyan shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-orbitron font-bold text-xs text-white uppercase tracking-wider">Secure Vulnerability Desk</span>
                        <span className="text-[10px] text-zinc-500 font-mono">ENCRYPTED GPG CHANNELS ACTIVE</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full mt-4 flex items-center justify-center gap-2 py-3 shadow-[0_0_12px_rgba(255,0,127,0.3)] border-cyber-pink bg-cyber-pink text-white hover:bg-cyber-pink/80">
                    Open Support Ticket
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>

              {/* Service status telemetry */}
              <Card
                title="Service status"
                subtitle="TELEMETRY DETAILS"
                techCorners={true}
                className="border-cyber-cyan/15"
              >
                <div className="space-y-4 font-mono text-xs text-left mt-2">
                  <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                    <span className="text-zinc-400 uppercase font-semibold flex items-center gap-2">
                      <Cpu className="h-3.5 w-3.5 text-cyber-cyan" />
                      Scanners
                    </span>
                    <Badge variant="success">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                    <span className="text-zinc-400 uppercase font-semibold flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5 text-cyber-cyan" />
                      Gemini Suggest
                    </span>
                    <Badge variant="success">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-zinc-400 uppercase font-semibold flex items-center gap-2">
                      <Terminal className="h-3.5 w-3.5 text-cyber-cyan" />
                      Sync Engine
                    </span>
                    <Badge variant="success">Operational</Badge>
                  </div>
                </div>
              </Card>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
