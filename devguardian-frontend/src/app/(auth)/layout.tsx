import * as React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030306] text-foreground cyber-grid-bg scanlines-overlay relative overflow-hidden p-4">
      {/* Decorative scan sweeper */}
      <div className="laser-scan-line" />
      
      {/* Decal Dot Matrix background */}
      <div className="absolute inset-0 cyber-grid-dot opacity-20 pointer-events-none" />
      
      {/* Side HUD Telemetry graphics (decorations) */}
      <div className="absolute top-8 left-8 hidden lg:flex flex-col gap-1 font-mono text-[10px] text-cyber-cyan/40 select-none">
        <span>[ SYSTEM BOOT SEQUENCE: ONLINE ]</span>
        <span>[ SECURITY PROTOCOL: SHIELD_ACTIVE ]</span>
        <span>[ DOCK NODE: DEVGUARDIAN_AUTH_GATE ]</span>
      </div>
      
      <div className="absolute bottom-8 right-8 hidden lg:flex flex-col gap-1 font-mono text-[10px] text-cyber-pink/40 select-none text-right">
        <span>SYS.LOC: CLOUD_SECURE_COCKPIT</span>
        <span>COMPLIANCE LEVEL: OWASP_2026_STABLE</span>
        <span>© 2026 DEVGUARDIAN. ALL RIGHTS RESERVED.</span>
      </div>

      {/* Main glassmorphic container */}
      <div className="relative z-20 w-full max-w-md bg-[#07070b]/90 border border-cyber-cyan/20 p-1 shadow-[0_0_30px_rgba(0,240,255,0.08)] cyber-card-clip">
        {/* Glow corner lines */}
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-cyber-cyan/50 to-transparent" />
        <div className="absolute -bottom-[0.5px] left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-cyber-pink/40 to-transparent" />
        
        {/* Tech Corner notches */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyber-cyan pointer-events-none opacity-60" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyber-pink pointer-events-none opacity-60" />

        <div className="px-6 py-8 relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
