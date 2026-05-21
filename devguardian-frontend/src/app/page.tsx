"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Zap, Terminal, Code2, Cpu, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-foreground selection:bg-primary/30 relative overflow-hidden flex flex-col justify-between">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-border/40 backdrop-blur-md sticky top-0 z-50 bg-black/40">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
          <span className="font-bold text-base tracking-tight text-white">DevGuardian</span>
        </div>
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#demo" className="hover:text-white transition-colors">Demo</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/register">
            <Button size="sm" className="shadow-md shadow-primary/10">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-20 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-semibold text-primary mb-6 animate-pulse">
          <Sparkles className="h-3 w-3" />
          Powered by Gemini Pro
        </div>
        <h1 className="max-w-4xl text-5xl sm:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1] bg-gradient-to-b from-white via-white to-zinc-400 bg-clip-text text-transparent">
          Secure Your Codebases <br />
          <span className="bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
            With AI Guardian Scans
          </span>
        </h1>
        <p className="max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed mb-10">
          DevGuardian continuously monitors, analyzes, and patches security vulnerabilities and code architecture issues inside your repositories autonomously.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-20 w-full sm:w-auto">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full group">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full">
              View Demo Dashboard
            </Button>
          </Link>
        </div>

        {/* Dashboard Mockup Preview */}
        <div id="demo" className="w-full max-w-5xl rounded-2xl border border-border bg-card/40 p-2 shadow-2xl relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-indigo-500/10 rounded-2xl opacity-50 blur-lg group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="rounded-xl overflow-hidden border border-border/80 bg-zinc-950/80 aspect-[16/9] flex items-center justify-center relative">
            <Terminal className="absolute top-4 left-4 h-4 w-4 text-muted-foreground/30" />
            <div className="flex flex-col items-center gap-4 text-center px-6">
              <Code2 className="h-12 w-12 text-primary" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">Continuous Security Intelligence</p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Interactive dashboards, vulnerability reports, and AI auto-fixes right inside your workflow.
                </p>
              </div>
              <Link href="/dashboard">
                <Button variant="secondary" size="sm">Explore Interactive App</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-24 w-full">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Enterprise Grade Security Features</h2>
            <p className="text-sm text-muted-foreground">
              Everything you need to ship secure software faster without blocking development pipelines.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
            <div className="p-6 rounded-2xl border border-border bg-card/30 hover:border-primary/30 transition-all duration-200">
              <Zap className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-base font-bold text-white mb-2">Automated Pull Request Scans</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Scan every commit and PR automatically for secrets, OWASP top 10 risks, and structural anomalies.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-border bg-card/30 hover:border-primary/30 transition-all duration-200">
              <Cpu className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-base font-bold text-white mb-2">AI-Powered Vulnerability Fixes</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Get more than just reports—receive complete git commits and PRs with verified fixes for your code.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-border bg-card/30 hover:border-primary/30 transition-all duration-200">
              <ShieldCheck className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-base font-bold text-white mb-2">Compliance Architecture reports</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Export comprehensive compliance audits for SOC2, HIPAA, and ISO 27001 configurations instantly.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-8 border-t border-border/30 text-center text-xs text-muted-foreground">
        <p>© 2026 DevGuardian Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
