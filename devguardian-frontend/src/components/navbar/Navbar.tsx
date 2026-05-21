import * as React from "react";
import UserProfileDropdown from "./UserProfileDropdown";
import { ShieldAlert, Bell, Search } from "lucide-react";
import Input from "../ui/Input";

export const Navbar: React.FC = () => {
  return (
    <header className="w-full bg-card/65 backdrop-blur-md border-b border-border sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
          <ShieldAlert className="h-4.5 w-4.5" />
        </div>
        <span className="font-bold text-base tracking-tight text-foreground">
          DevGuardian
        </span>
      </div>

      {/* Global Search Bar */}
      <div className="hidden md:flex max-w-sm w-full relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
        <Input
          placeholder="Search repositories, issues, analysis..."
          className="pl-10 py-1.5 bg-black/25 text-xs rounded-xl"
        />
      </div>

      {/* Navigation Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications Icon */}
        <button
          className="relative p-2 hover:bg-secondary rounded-xl text-muted-foreground hover:text-foreground transition-all duration-200"
          aria-label="View notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>

        {/* User Profile */}
        <UserProfileDropdown />
      </div>
    </header>
  );
};

export default Navbar;
