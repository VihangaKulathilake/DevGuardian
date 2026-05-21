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
    <aside className="w-64 bg-card border-r border-border h-[calc(100vh-73px)] hidden md:flex flex-col justify-between p-4 sticky top-[73px]">
      <div className="flex flex-col gap-1">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = currentPath === item.href;
          return (
            <a
              key={index}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-4.5 w-4.5" />
              {item.label}
            </a>
          );
        })}
      </div>

      <div className="flex flex-col gap-1 border-t border-border pt-4">
        <a
          href="/support"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
        >
          <HelpCircle className="h-4.5 w-4.5" />
          Support & Docs
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
