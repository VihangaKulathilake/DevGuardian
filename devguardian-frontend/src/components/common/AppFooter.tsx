import * as React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowUp, Lock, Sparkles, CheckCircle2, ShieldAlert, Cpu, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppFooterProps {
  className?: string;
  compact?: boolean;
}

export const AppFooter: React.FC<AppFooterProps> = ({ className, compact = false }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      className={cn(
        "w-full border-t border-border/70 bg-[#040408]/95 text-zinc-400 font-sans mt-12 relative overflow-hidden backdrop-blur-md select-none",
        className
      )}
    >
      {/* Top subtle highlight border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/30 to-transparent" />

      <div className="max-w-[1600px] mx-auto px-6 py-8 md:py-10">
        {!compact && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left">
            {/* Column 1: Brand & Status */}
            <div className="md:col-span-2 space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 border border-cyber-cyan/60 bg-cyber-cyan/10 text-cyber-cyan flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                  <ShieldCheck className="h-4 w-4 stroke-[2.5]" />
                </div>
                <span className="font-orbitron font-extrabold text-sm tracking-wider text-white uppercase">
                  Dev<span className="text-cyber-cyan">Guardian</span>
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 border border-zinc-700 bg-zinc-900 text-zinc-300 uppercase tracking-wider">
                  v2.4.0
                </span>
              </div>

              <p className="text-xs text-zinc-400 max-w-md font-sans leading-relaxed">
                Autonomous DevSecOps & AST code vulnerability analysis platform. Continuously auditing codebases for OWASP Top 10 vulnerabilities, exposed secrets, and security weaknesses.
              </p>

              <div className="flex items-center gap-3 pt-1 flex-wrap">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-[#00ff66]/30 bg-[#00ff66]/5 text-[#00ff66] text-[10px] font-mono font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyber-green animate-pulse" />
                  <span>Security Engine: Operational</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-cyber-cyan/30 bg-cyber-cyan/5 text-cyber-cyan text-[10px] font-mono font-medium">
                  <Sparkles className="h-3 w-3" />
                  <span>Google Gemini AI Core</span>
                </div>
              </div>
            </div>

            {/* Column 2: System Navigation */}
            <div className="space-y-3">
              <h5 className="text-[11px] font-orbitron font-bold text-white uppercase tracking-wider">
                System Cockpit
              </h5>
              <ul className="space-y-2 text-xs font-sans">
                <li>
                  <Link href="/dashboard" className="text-zinc-400 hover:text-cyber-cyan transition-colors">
                    Dashboard Overview
                  </Link>
                </li>
                <li>
                  <Link href="/repositories" className="text-zinc-400 hover:text-cyber-cyan transition-colors">
                    Linked Repositories
                  </Link>
                </li>
                <li>
                  <Link href="/analysis" className="text-zinc-400 hover:text-cyber-cyan transition-colors">
                    Security Analysis Cockpit
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className="text-zinc-400 hover:text-cyber-cyan transition-colors">
                    Account & Node Settings
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Standards & Docs */}
            <div className="space-y-3">
              <h5 className="text-[11px] font-orbitron font-bold text-white uppercase tracking-wider">
                Standards & Compliance
              </h5>
              <ul className="space-y-2 text-xs font-sans">
                <li>
                  <Link href="/support" className="text-zinc-400 hover:text-cyber-cyan transition-colors">
                    Documentation & Platform Guide
                  </Link>
                </li>
                <li className="text-zinc-400">
                  OWASP Top 10 Standards
                </li>
                <li className="text-zinc-400">
                  CWE / SANS Top 25 Coverage
                </li>
                <li className="text-zinc-400">
                  Secret Shield Pattern Library
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="pt-5 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-zinc-500">
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
            <span>© 2026 DevGuardian Inc. All rights reserved.</span>
            <span className="text-zinc-700 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px]">
              <Lock className="h-3 w-3 text-cyber-green" />
              AES-256 Sandboxed Enclave
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-zinc-400 text-xs">
              Enterprise DevSecOps Intelligence Suite
            </span>
            <button
              onClick={scrollToTop}
              className="p-1.5 border border-zinc-800 hover:border-cyber-cyan hover:text-cyber-cyan text-zinc-400 transition-colors cursor-pointer"
              title="Back to top"
              aria-label="Back to top"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
