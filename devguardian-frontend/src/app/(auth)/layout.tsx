import * as React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#05060b] text-foreground relative overflow-hidden p-4 sm:p-6 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Ambient background glow highlights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-cyan-500/10 via-blue-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-t from-cyan-500/5 to-transparent blur-3xl pointer-events-none" />
      
      {/* Subtle decorative grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_80%)] pointer-events-none" />

      {/* Main glassmorphic card container */}
      <div className="relative z-10 w-full max-w-[440px] bg-[#0c0e18]/90 backdrop-blur-2xl border border-zinc-800/80 rounded-2xl p-7 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_30px_rgba(0,240,255,0.04)]">
        {/* Top edge glow accent */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
        
        {children}
      </div>

      {/* Professional subtle footer */}
      <div className="mt-8 text-center text-xs text-zinc-500 font-medium">
        <span>&copy; {new Date().getFullYear()} DevGuardian. All rights reserved.</span>
      </div>
    </div>
  );
}
