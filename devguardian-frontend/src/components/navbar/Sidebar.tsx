import * as React from "react";
import {
  LayoutDashboard,
  GitFork,
  ShieldCheck,
  Settings,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarProps {
  currentPath?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath = "/dashboard" }) => {
  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Repositories", icon: GitFork, href: "/repositories" },
    { label: "Security Analysis", icon: ShieldCheck, href: "/analysis" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <aside className="w-64 bg-[#07070c]/85 border-r border-border/75 h-[calc(100vh-73px)] hidden md:flex flex-col justify-between p-4 sticky top-[73px] backdrop-blur-md z-30">
      <div className="flex flex-col gap-2 relative">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = currentPath === item.href;
          return (
            <a
              key={index}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-[10px] font-orbitron font-bold uppercase tracking-widest transition-all duration-300 relative border cursor-pointer",
                "cyber-btn-clip",
                isActive
                  ? "bg-cyber-cyan/5 text-cyber-cyan border-cyber-cyan/35 shadow-[0_0_12px_rgba(0,240,255,0.12)]"
                  : "bg-transparent text-muted-foreground border-transparent hover:text-white hover:bg-secondary/40 hover:border-border/60"
              )}
            >
              {/* Active Neon side marker */}
              {isActive && (
                <div className="absolute left-0 top-0 h-full w-[3px] bg-cyber-cyan shadow-[0_0_8px_var(--color-cyber-cyan)]" />
              )}
              <Icon className="h-4.5 w-4.5" />
              {item.label}
            </a>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 border-t border-border/80 pt-4">
        <a
          href="/support"
          className="flex items-center gap-3 px-4 py-3 border border-transparent text-[10px] font-orbitron font-bold uppercase tracking-widest text-muted-foreground hover:bg-secondary/40 hover:border-border/60 hover:text-white transition-all duration-300 cyber-btn-clip"
        >
          <HelpCircle className="h-4.5 w-4.5 text-cyber-purple" />
          Support & Docs
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;

