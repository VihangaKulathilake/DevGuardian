import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Cpu, Terminal, ArrowUp, Lock, Sparkles, ExternalLink } from "lucide-react";
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
        "w-full border-t border-cyber-cyan/15 bg-[#040409]/95 text-zinc-400 font-sans mt-12 relative overflow-hidden backdrop-blur-md select-none",
        className
      )}
    >
      {/* Subtle top neon glow line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/40 to-transparent" />

      <div className="max-w-[1600px] mx-auto px-6 py-8 md:py-10">
        {!compact && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left">
            {/* Column 1: Brand & Status */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-none border border-cyber-cyan bg-cyber-cyan/10 text-cyber-cyan flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.25)]">
                  <ShieldCheck className="h-4 w-4 stroke-[2.5]" />
                </div>
                <span className="font-orbitron font-extrabold text-sm tracking-wider text-white uppercase">
                  Dev<span className="text-cyber-cyan">Guardian</span>
                </span>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 border border-cyber-purple/40 bg-cyber-purple/10 text-cyber-purple uppercase tracking-widest">
                  v2.4.0
                </span>
              </div>

              <p className="text-xs text-zinc-400 max-w-md font-sans leading-relaxed">
                Autonomous DevSecOps & AST code vulnerability analysis engine. Continuously inspecting repositories for OWASP Top 10 vulnerabilities, secrets, and code quality flaws.
              </p>

              <div className="flex items-center gap-3 pt-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-[#00ff66]/30 bg-[#00ff66]/5 text-[#00ff66] text-[10px] font-mono tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyber-green animate-pulse" />
                  <span>ANALYSIS ENGINE: OPERATIONAL</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-cyber-cyan/30 bg-cyber-cyan/5 text-cyber-cyan text-[10px] font-mono tracking-wider">
                  <Sparkles className="h-3 w-3" />
                  <span>GEMINI AI CORE</span>
                </div>
              </div>
            </div>

            {/* Column 2: System Navigation */}
            <div className="space-y-2.5">
              <h5 className="text-[11px] font-orbitron font-bold text-white uppercase tracking-wider">
                System Cockpit
              </h5>
              <ul className="space-y-1.5 text-xs font-mono">
                <li>
                  <Link href="/dashboard" className="text-zinc-400 hover:text-cyber-cyan transition-colors">
                    // Dashboard Overview
                  </Link>
                </li>
                <li>
                  <Link href="/repositories" className="text-zinc-400 hover:text-cyber-cyan transition-colors">
                    // Linked Repositories
                  </Link>
                </li>
                <li>
                  <Link href="/analysis" className="text-zinc-400 hover:text-cyber-cyan transition-colors">
                    // Security Analysis
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className="text-zinc-400 hover:text-cyber-cyan transition-colors">
                    // Node Settings
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Security & Support */}
            <div className="space-y-2.5">
              <h5 className="text-[11px] font-orbitron font-bold text-white uppercase tracking-wider">
                Standards & Docs
              </h5>
              <ul className="space-y-1.5 text-xs font-mono">
                <li>
                  <Link href="/support" className="text-zinc-400 hover:text-cyber-cyan transition-colors">
                    // Documentation & CLI
                  </Link>
                </li>
                <li className="text-zinc-500">
                  // OWASP Top 10 2026
                </li>
                <li className="text-zinc-500">
                  // CWE / SANS Top 25
                </li>
                <li className="text-zinc-500">
                  // Secret Shield v2
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="pt-5 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-zinc-500">
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
            <span>© 2026 DevGuardian Inc.</span>
            <span className="text-zinc-700 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Lock className="h-3 w-3 text-cyber-green" />
              End-to-End Sandboxed Enclave
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-zinc-400">
              DevSecOps Intelligence Suite
            </span>
            <button
              onClick={scrollToTop}
              className="p-1.5 border border-zinc-800 hover:border-cyber-cyan hover:text-cyber-cyan text-zinc-500 transition-colors cursor-pointer"
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
