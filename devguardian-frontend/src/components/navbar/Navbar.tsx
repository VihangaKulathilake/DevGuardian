import * as React from "react";
import UserProfileDropdown from "./UserProfileDropdown";
import NotificationDropdown from "./NotificationDropdown";
import { ShieldAlert, Search } from "lucide-react";
import Input from "../ui/Input";

export const Navbar: React.FC = () => {
  return (
    <header className="w-full bg-[#07070c]/80 backdrop-blur-md border-b border-cyber-cyan/15 sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-sm bg-cyber-cyan text-black flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.45)]">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <span className="font-orbitron font-black text-sm tracking-widest text-white uppercase">
          Dev<span className="text-cyber-cyan">Guardian</span>
        </span>
      </div>

      {/* Global Search Bar */}
      <div className="hidden md:flex max-w-sm w-full relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
        <Input
          placeholder="SEARCH SYSTEM DIRECTORY..."
          className="pl-10 py-2 bg-black/45 text-[10px] uppercase font-mono tracking-wider border-border/80"
          mono={true}
        />
      </div>

      {/* Navigation Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications Icon */}
        <NotificationDropdown />

        {/* User Profile */}
        <UserProfileDropdown />
      </div>
    </header>
  );
};

export default Navbar;

