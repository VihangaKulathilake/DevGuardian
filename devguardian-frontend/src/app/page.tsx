"use client";

import * as React from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Code2, 
  Cpu, 
  Sparkles, 
  Database,
  Lock,
  CheckCircle2,
  FileCode2,
  GitPullRequest,
  GitBranch,
  Layers,
  Server,
  KeyRound
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAppSelector } from "@/hooks/useRedux";

export default function LandingPage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-[#050508] text-foreground selection:bg-cyber-cyan/30 relative overflow-hidden flex flex-col justify-between cyber-grid-bg">
      {/* Ambient Lighting & Glows */}
      <div className="absolute top-[-8%] left-1/3 w-[650px] h-[550px] bg-cyber-cyan/10 rounded-full blur-[170px] pointer-events-none" />
      <div className="absolute top-[45%] right-[-10%] w-[550px] h-[550px] bg-cyber-purple/10 rounded-full blur-[170px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-cyber-blue/10 rounded-full blur-[170px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between border-b border-border/60 backdrop-blur-xl sticky top-0 z-50 bg-[#050508]/80">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-gradient-to-tr from-cyber-cyan to-cyber-blue text-black flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.35)]">
            <ShieldCheck className="h-5 w-5 text-black stroke-[2.5]" />
          </div>
          <span className="font-orbitron font-extrabold text-lg tracking-wider text-white">
            Dev<span className="text-cyber-cyan">Guardian</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-zinc-400">
          <a href="#features" className="hover:text-cyber-cyan transition-colors">CAPABILITIES</a>
          <a href="#architecture" className="hover:text-cyber-cyan transition-colors">ARCHITECTURE</a>
          <a href="#how-it-works" className="hover:text-cyber-cyan transition-colors">HOW IT WORKS</a>
          <a href="#compliance" className="hover:text-cyber-cyan transition-colors">COMPLIANCE</a>
          <a href="#integrations" className="hover:text-cyber-cyan transition-colors">ECOSYSTEM</a>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button variant="primary" size="sm" className="shadow-lg shadow-cyber-cyan/20">
                ENTER DASHBOARD
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-xs font-semibold text-zinc-300 hover:text-white px-3 py-1.5 transition-colors">
                Sign In
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm" className="shadow-lg shadow-cyber-cyan/20">
                  Get Started Free
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-20 pb-24 flex flex-col items-center text-center">
        
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyber-cyan/30 bg-cyber-cyan/5 text-[11px] font-semibold text-cyber-cyan mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.15)]">
          <Sparkles className="h-3.5 w-3.5 text-cyber-cyan" />
          <span>Next-Gen Autonomous DevSecOps • Powered by Google Gemini</span>
        </div>

        {/* Hero Title */}
        <h1 className="max-w-4xl text-4xl sm:text-6xl md:text-7xl font-orbitron font-black tracking-tight text-white mb-6 leading-[1.1]">
          Continuous Code Security & <br />
          <span className="bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-pink bg-clip-text text-transparent filter drop-shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            Autonomous AI Remediation
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="max-w-2xl text-sm sm:text-base text-zinc-400 font-normal leading-relaxed mb-10">
          DevGuardian provides deep AST static analysis, instant secret leak prevention, and automated AI pull requests to resolve critical vulnerabilities before they reach production.
        </p>

        {/* Hero CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full sm:w-auto">
          {isAuthenticated ? (
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full group px-8">
                Open Security Dashboard
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" variant="primary" className="w-full group px-8 shadow-xl shadow-cyber-cyan/25">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full px-8">
                  Explore Live Platform
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Trust & Performance Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full max-w-4xl mb-24 text-left">
          <div className="bg-[#0b0b14]/70 border border-border/80 rounded-xl p-5 backdrop-blur-md">
            <div className="flex items-center gap-2 text-cyber-cyan mb-1.5">
              <Zap className="h-4 w-4" />
              <span className="font-orbitron font-bold text-xl text-white">&lt; 1.2s</span>
            </div>
            <span className="text-xs text-zinc-400 font-medium">Real-Time AST Scan Latency</span>
          </div>

          <div className="bg-[#0b0b14]/70 border border-border/80 rounded-xl p-5 backdrop-blur-md">
            <div className="flex items-center gap-2 text-cyber-green mb-1.5">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-orbitron font-bold text-xl text-white">99.8%</span>
            </div>
            <span className="text-xs text-zinc-400 font-medium">Precision (Zero False Positives)</span>
          </div>

          <div className="bg-[#0b0b14]/70 border border-border/80 rounded-xl p-5 backdrop-blur-md">
            <div className="flex items-center gap-2 text-cyber-purple mb-1.5">
              <GitPullRequest className="h-4 w-4" />
              <span className="font-orbitron font-bold text-xl text-white">50k+</span>
            </div>
            <span className="text-xs text-zinc-400 font-medium">Auto-Remediated Pull Requests</span>
          </div>

          <div className="bg-[#0b0b14]/70 border border-border/80 rounded-xl p-5 backdrop-blur-md">
            <div className="flex items-center gap-2 text-cyber-pink mb-1.5">
              <Lock className="h-4 w-4" />
              <span className="font-orbitron font-bold text-xl text-white">100%</span>
            </div>
            <span className="text-xs text-zinc-400 font-medium">OWASP Top 10 & CWE Coverage</span>
          </div>
        </div>

        {/* Platform Architecture & Flow Diagram */}
        <section id="architecture" className="w-full max-w-5xl text-left mb-28 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-mono font-bold text-cyber-cyan uppercase tracking-widest mb-2">
              PLATFORM ARCHITECTURE
            </h2>
            <h3 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-white">
              End-to-End DevSecOps Pipeline
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              How DevGuardian intercepts commits, executes multi-stage security audits, and generates verified code fixes.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#080811] border border-border/90 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
              
              {/* Architecture Node 1 */}
              <div className="p-5 rounded-xl bg-[#0d0d1a] border border-border/80 flex flex-col justify-between">
                <div>
                  <div className="h-8 w-8 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan flex items-center justify-center mb-3">
                    <GitBranch className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">STAGE 01</span>
                  <h4 className="text-sm font-bold text-white mb-2">Git Trigger & Webhooks</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Monitors pull requests and commits across GitHub, GitLab, and Bitbucket in real-time.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 text-[10px] font-mono text-cyber-cyan">
                  ⚡ Zero-config Webhooks
                </div>
              </div>

              {/* Architecture Node 2 */}
              <div className="p-5 rounded-xl bg-[#0d0d1a] border border-border/80 flex flex-col justify-between">
                <div>
                  <div className="h-8 w-8 rounded-lg bg-cyber-purple/10 border border-cyber-purple/30 text-cyber-purple flex items-center justify-center mb-3">
                    <Zap className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">STAGE 02</span>
                  <h4 className="text-sm font-bold text-white mb-2">Deep AST & Secret Engine</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Abstract Syntax Tree evaluation detects SQLi, XSS, broken auth, and entropy-leaked API credentials.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 text-[10px] font-mono text-cyber-purple">
                  🔍 Multi-rule Static Parser
                </div>
              </div>

              {/* Architecture Node 3 */}
              <div className="p-5 rounded-xl bg-[#0d0d1a] border border-border/80 flex flex-col justify-between">
                <div>
                  <div className="h-8 w-8 rounded-lg bg-cyber-pink/10 border border-cyber-pink/30 text-cyber-pink flex items-center justify-center mb-3">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">STAGE 03</span>
                  <h4 className="text-sm font-bold text-white mb-2">Gemini AI Remediation</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Synthesizes repository-tailored code patches that resolve vulnerabilities without breaking existing APIs.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 text-[10px] font-mono text-cyber-pink">
                  🤖 Context-Aware AI Patches
                </div>
              </div>

              {/* Architecture Node 4 */}
              <div className="p-5 rounded-xl bg-[#0d0d1a] border border-border/80 flex flex-col justify-between">
                <div>
                  <div className="h-8 w-8 rounded-lg bg-cyber-green/10 border border-cyber-green/30 text-cyber-green flex items-center justify-center mb-3">
                    <GitPullRequest className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">STAGE 04</span>
                  <h4 className="text-sm font-bold text-white mb-2">Verified Pull Request</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Automatically opens a signed pull request with unit test assertions and security audit documentation.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 text-[10px] font-mono text-cyber-green">
                  🛡️ 1-Click Auto-Merge
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Enterprise Feature Bento Grid */}
        <section id="features" className="py-16 w-full text-left max-w-6xl scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono font-bold text-cyber-cyan uppercase tracking-widest mb-2">
              ENTERPRISE CAPABILITIES
            </h2>
            <h3 className="text-3xl font-orbitron font-extrabold text-white mb-4">
              Autonomous Code Protection at Every Commit
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Designed from the ground up for engineering organizations that require enterprise security assurance without sacrificing developer productivity.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card className="p-6 bg-[#080811] hover:border-cyber-cyan/40 transition-all duration-300">
              <div className="h-10 w-10 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan flex items-center justify-center mb-4">
                <Sparkles className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold font-orbitron text-white uppercase tracking-wider mb-2">
                Autonomous AI Remediation
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                DevGuardian doesn&apos;t just notify you about vulnerabilities—it writes the fix, formats the code, and creates complete GitHub Pull Requests automatically.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 bg-[#080811] hover:border-cyber-purple/40 transition-all duration-300">
              <div className="h-10 w-10 rounded-lg bg-cyber-purple/10 border border-cyber-purple/30 text-cyber-purple flex items-center justify-center mb-4">
                <Zap className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold font-orbitron text-white uppercase tracking-wider mb-2">
                Sub-Second AST Scanning
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Deep Abstract Syntax Tree parsing audits code logic in milliseconds. Catch complex flaws like SQLi, SSRF, IDOR, and broken access controls.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6 bg-[#080811] hover:border-cyber-pink/40 transition-all duration-300">
              <div className="h-10 w-10 rounded-lg bg-cyber-pink/10 border border-cyber-pink/30 text-cyber-pink flex items-center justify-center mb-4">
                <KeyRound className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold font-orbitron text-white uppercase tracking-wider mb-2">
                Zero-Leak Secret Shield
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Continuous high-entropy scanning blocks AWS keys, Stripe secrets, JWT tokens, and private certificates before they are ever committed to git.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="p-6 bg-[#080811] hover:border-cyber-green/40 transition-all duration-300">
              <div className="h-10 w-10 rounded-lg bg-cyber-green/10 border border-cyber-green/30 text-cyber-green flex items-center justify-center mb-4">
                <GitBranch className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold font-orbitron text-white uppercase tracking-wider mb-2">
                CI/CD & Pre-Commit Gates
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Integrates natively into GitHub Actions, GitLab CI, and Bitbucket. Block insecure code merges with customizable compliance policy rules.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="p-6 bg-[#080811] hover:border-cyber-blue/40 transition-all duration-300">
              <div className="h-10 w-10 rounded-lg bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue flex items-center justify-center mb-4">
                <Lock className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold font-orbitron text-white uppercase tracking-wider mb-2">
                Audit-Ready Compliance
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Generate instant executive compliance reports for SOC 2 Type II, ISO 27001, HIPAA, and PCI-DSS with historical vulnerability tracking.
              </p>
            </Card>

            {/* Feature 6 */}
            <Card className="p-6 bg-[#080811] hover:border-cyber-cyan/40 transition-all duration-300">
              <div className="h-10 w-10 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan flex items-center justify-center mb-4">
                <Database className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold font-orbitron text-white uppercase tracking-wider mb-2">
                Multi-Language Support
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Out-of-the-box analysis for Java (Spring Boot), TypeScript/JavaScript, Python (FastAPI/Django), Go, Dockerfiles, and Terraform infrastructure.
              </p>
            </Card>
          </div>
        </section>

        {/* How It Works 3-Step Flow */}
        <section id="how-it-works" className="py-16 w-full text-left max-w-6xl scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono font-bold text-cyber-cyan uppercase tracking-widest mb-2">
              STREAMLINED WORKFLOW
            </h2>
            <h3 className="text-3xl font-orbitron font-extrabold text-white mb-4">
              How DevGuardian Protects Your Repositories
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400">
              Three simple steps to transition from manual vulnerability triaging to autonomous remediation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-[#080811] border border-border/80 rounded-2xl p-6 relative">
              <div className="text-4xl font-black font-orbitron text-cyber-cyan/20 mb-4">01</div>
              <h4 className="text-sm font-bold font-orbitron text-white uppercase mb-2">Connect Repository</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Authorize GitHub, GitLab, or Bitbucket in one click. DevGuardian configures automated webhooks with zero custom YAML setup needed.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#080811] border border-border/80 rounded-2xl p-6 relative">
              <div className="text-4xl font-black font-orbitron text-cyber-purple/20 mb-4">02</div>
              <h4 className="text-sm font-bold font-orbitron text-white uppercase mb-2">Autonomous AI Audit</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                On every commit or pull request, Gemini AI evaluates AST semantics, detects security risks, and generates regression-free code patches.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#080811] border border-border/80 rounded-2xl p-6 relative">
              <div className="text-4xl font-black font-orbitron text-cyber-green/20 mb-4">03</div>
              <h4 className="text-sm font-bold font-orbitron text-white uppercase mb-2">Review & Auto-Merge</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Approve verified security pull requests directly from your dashboard or GitHub interface. Your code stays clean, secured, and compliant.
              </p>
            </div>
          </div>
        </section>

        {/* Security & Compliance Standards Section */}
        <section id="compliance" className="py-16 w-full max-w-6xl text-left scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono font-bold text-cyber-cyan uppercase tracking-widest mb-2">
              SECURITY & COMPLIANCE STANDARDS
            </h2>
            <h3 className="text-3xl font-orbitron font-extrabold text-white mb-4">
              Enterprise-Grade Governance & Privacy
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              DevGuardian adheres to the world&apos;s most stringent cybersecurity and regulatory frameworks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl bg-[#080811] border border-border/80 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-cyber-cyan font-mono block mb-1">STANDARD 01</span>
                <h4 className="text-sm font-bold text-white mb-2">OWASP Top 10</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Full coverage against injection, broken access control, cryptographic failures, and SSRF.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#080811] border border-border/80 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-cyber-purple font-mono block mb-1">STANDARD 02</span>
                <h4 className="text-sm font-bold text-white mb-2">SOC 2 Type II</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Automated audit trail generation and compliance logs for external security certification.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#080811] border border-border/80 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-cyber-pink font-mono block mb-1">STANDARD 03</span>
                <h4 className="text-sm font-bold text-white mb-2">CWE / SANS Top 25</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Precision detection of the most dangerous software weaknesses with CVSS severity scoring.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#080811] border border-border/80 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-cyber-green font-mono block mb-1">STANDARD 04</span>
                <h4 className="text-sm font-bold text-white mb-2">ISO / IEC 27001</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Rigorous information security management policies, encrypted telemetry, and zero data retention.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Supported Ecosystem Bar */}
        <section id="integrations" className="py-12 w-full max-w-5xl scroll-mt-24">
          <div className="p-8 rounded-2xl bg-[#080811] border border-border/80 text-center">
            <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-6">
              ENGINEERED FOR MODERN TECH STACKS & CLOUD ECOSYSTEMS
            </span>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-mono text-zinc-300 font-semibold">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900/60 border border-zinc-800">
                <FileCode2 className="h-4 w-4 text-cyber-cyan" />
                <span>Java / Spring Boot</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900/60 border border-zinc-800">
                <Code2 className="h-4 w-4 text-cyber-pink" />
                <span>TypeScript / React</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900/60 border border-zinc-800">
                <Cpu className="h-4 w-4 text-cyber-green" />
                <span>Python / FastAPI</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900/60 border border-zinc-800">
                <Layers className="h-4 w-4 text-cyber-purple" />
                <span>Go / Rust</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900/60 border border-zinc-800">
                <Server className="h-4 w-4 text-cyber-blue" />
                <span>Docker & K8s</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900/60 border border-zinc-800">
                <GitBranch className="h-4 w-4 text-white" />
                <span>GitHub & GitLab</span>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="mt-12 w-full max-w-5xl">
          <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-b from-[#0c0c1a] to-[#06060c] border border-cyber-cyan/30 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-cyber-cyan/5 pointer-events-none" />
            <h3 className="text-3xl sm:text-4xl font-orbitron font-black text-white uppercase tracking-tight mb-4 relative z-10">
              Ready to Automate Your Code Security?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto mb-8 relative z-10 leading-relaxed">
              Connect your first repository in under two minutes. Experience autonomous vulnerability remediation powered by Google Gemini.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" variant="primary" className="px-8 shadow-xl shadow-cyber-cyan/25">
                    Launch Security Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button size="lg" variant="primary" className="px-8 shadow-xl shadow-cyber-cyan/25">
                      Start 14-Day Free Trial
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="secondary" className="px-8">
                      Sign In to Console
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

      </main>

      {/* Corporate Professional Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-12 border-t border-border/60">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12 text-left">
          
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-gradient-to-tr from-cyber-cyan to-cyber-blue text-black flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                <ShieldCheck className="h-4 w-4 text-black stroke-[2.5]" />
              </div>
              <span className="font-orbitron font-extrabold text-base tracking-wider text-white">
                Dev<span className="text-cyber-cyan">Guardian</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
              Autonomous AI DevSecOps platform empowering developers to scan, detect, and automatically remediate security vulnerabilities across enterprise codebases.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-cyber-green">
              <span className="h-2 w-2 rounded-full bg-cyber-green animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Column 1: Platform */}
          <div className="space-y-3">
            <h5 className="text-xs font-orbitron font-bold text-white uppercase tracking-wider">Platform</h5>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><a href="#features" className="hover:text-cyber-cyan transition-colors">AST Static Engine</a></li>
              <li><a href="#features" className="hover:text-cyber-cyan transition-colors">Secret Shield</a></li>
              <li><a href="#features" className="hover:text-cyber-cyan transition-colors">CI/CD Gates</a></li>
              <li><a href="#features" className="hover:text-cyber-cyan transition-colors">AI Remediation</a></li>
            </ul>
          </div>

          {/* Column 2: Solutions */}
          <div className="space-y-3">
            <h5 className="text-xs font-orbitron font-bold text-white uppercase tracking-wider">Solutions</h5>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><a href="#compliance" className="hover:text-cyber-cyan transition-colors">OWASP Top 10</a></li>
              <li><a href="#compliance" className="hover:text-cyber-cyan transition-colors">SOC 2 Compliance</a></li>
              <li><a href="#compliance" className="hover:text-cyber-cyan transition-colors">ISO 27001</a></li>
              <li><a href="/support" className="hover:text-cyber-cyan transition-colors">Support & Docs</a></li>
            </ul>
          </div>

          {/* Column 3: Legal & Security */}
          <div className="space-y-3">
            <h5 className="text-xs font-orbitron font-bold text-white uppercase tracking-wider">Trust & Security</h5>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><a href="#" className="hover:text-cyber-cyan transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-cyber-cyan transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-cyber-cyan transition-colors">Security Whitepaper</a></li>
              <li><a href="#" className="hover:text-cyber-cyan transition-colors">Responsible Disclosure</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-mono">
          <p>© 2026 DevGuardian Inc. All rights reserved.</p>
          <p>Powered by Google Gemini AI</p>
        </div>
      </footer>
    </div>
  );
}
