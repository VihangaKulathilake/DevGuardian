"use client";

import * as React from "react";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/navbar/Sidebar";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Terminal, Shield, BookOpen, Key, GitBranch, MessageSquare, ExternalLink } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar currentPath="/support" />
        <main className="flex-1 p-6 md:p-8 bg-background overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
              Support & Documentation
            </h1>
            <p className="text-sm text-muted-foreground">
              Learn how to configure automated scans, trigger CLI tools, and resolve vulnerabilities.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 max-w-7xl">
            {/* Main Documentation Content */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* CLI Integration Guide */}
              <Card
                title={
                  <div className="flex items-center gap-2.5">
                    <Terminal className="h-4.5 w-4.5 text-primary" />
                    <span>CLI & CI/CD Pipeline Scan</span>
                  </div>
                }
                subtitle="Run DevGuardian static analysis locally or inside your build server (GitHub Actions, GitLab CI)."
              >
                <div className="flex flex-col gap-4 text-xs">
                  <p className="text-muted-foreground leading-relaxed text-left">
                    You can integrate DevGuardian directly into your terminals or build agents by running our CLI scanner. Get your authentication token from the <a href="/settings" className="text-primary hover:underline font-semibold">Settings</a> tab.
                  </p>
                  
                  <div className="bg-black/45 border border-border p-4 rounded-xl font-mono text-[11px] leading-relaxed text-zinc-300 select-all text-left">
                    <span className="text-zinc-600"># Install the DevGuardian scanner globally</span><br />
                    npm install -g @devguardian/cli<br /><br />
                    <span className="text-zinc-600"># Authenticate the CLI with your workspace token</span><br />
                    devguardian auth --token dg_live_83a1f9e2...<br /><br />
                    <span className="text-zinc-600"># Trigger a local static analysis scan</span><br />
                    devguardian scan --path ./src
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <span className="text-muted-foreground">Compatible CI hosts:</span>
                    <Badge variant="neutral">GitHub Actions</Badge>
                    <Badge variant="neutral">GitLab CI/CD</Badge>
                    <Badge variant="neutral">CircleCI</Badge>
                  </div>
                </div>
              </Card>

              {/* Core Features Documentation */}
              <Card
                title={
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="h-4.5 w-4.5 text-primary" />
                    <span>Getting Started Guides</span>
                  </div>
                }
                subtitle="Understand the key modules and scanning policies enforced by the engine."
              >
                <div className="flex flex-col gap-5 text-xs text-left">
                  <div className="border-b border-border/60 pb-4">
                    <h4 className="font-semibold text-white mb-1 flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-emerald-400" />
                      1. Security Scans and OWASP Rules
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      DevGuardian checks your codebase for hardcoded keys, SQL injections, insecure catch blocks, and exposed configuration profiles. Every scan assigns a security grade from A to F based on issue density.
                    </p>
                  </div>

                  <div className="border-b border-border/60 pb-4">
                    <h4 className="font-semibold text-white mb-1 flex items-center gap-1.5">
                      <GitBranch className="h-3.5 w-3.5 text-indigo-400" />
                      2. Automated Pull Request Scanning
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      By configuring your GitHub app or webhook preferences, DevGuardian runs tests against every incoming pull request branch and leaves inline code review comments.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-1 flex items-center gap-1.5">
                      <Key className="h-3.5 w-3.5 text-amber-500" />
                      3. Dynamic Secure Diff Remediations
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      When vulnerability rules trigger, DevGuardian leverages Gemini AI to generate a side-by-side patch layout code preview. Clicking "Apply Patch" commits the secure code revision back to the target branch.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar Support Panel */}
            <div className="flex flex-col gap-6">
              <Card
                title="Need Help?"
                subtitle="Get in touch with the DevGuardian security engineering team."
              >
                <div className="flex flex-col gap-4 text-xs text-left">
                  <p className="text-muted-foreground leading-relaxed">
                    Have questions about specific rule exceptions, false positives, or enterprise self-hosted deployment? We're available 24/7.
                  </p>

                  <div className="space-y-3.5 mt-2">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-white">Live Workspace Chat</span>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">Average response time is less than 5 minutes.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Shield className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-white">Security Vulnerability Disclosure</span>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">Report suspected bugs securely via email.</p>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full mt-4 flex items-center justify-center gap-2">
                    Open Support Ticket
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>

              {/* System Status Panel */}
              <Card
                title="Service Status"
                subtitle="Continuous monitoring details"
              >
                <div className="flex flex-col gap-3 text-xs text-left">
                  <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                    <span className="text-muted-foreground">Vulnerability Scanners</span>
                    <Badge variant="success">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                    <span className="text-muted-foreground">AI Suggestion Engine</span>
                    <Badge variant="success">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-muted-foreground">Repository Sync Engine</span>
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
