import * as React from "react";
import { User, LogOut, Settings as SettingsIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { logout } from "@/features/auth/authSlice";

export const UserProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = () => {
    if (!user?.name) return "DG";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 hover:bg-secondary rounded-xl transition-all duration-200 focus:outline-none"
      >
        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
          {getInitials()}
        </div>
        <div className="hidden sm:flex flex-col items-start text-left">
          <span className="text-xs font-semibold text-foreground">
            {user?.name || "Dev Guardian"}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {user?.email || "admin@devguardian.io"}
          </span>
        </div>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform duration-200", {
          "rotate-180": isOpen
        })} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl overflow-hidden py-1.5 z-50 animate-in fade-in-50 slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 border-b border-border mb-1">
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              My Account
            </p>
          </div>

          <a
            href="/settings"
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors duration-150"
          >
            <User className="h-3.5 w-3.5" />
            Profile Settings
          </a>

          <a
            href="/settings"
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors duration-150"
          >
            <SettingsIcon className="h-3.5 w-3.5" />
            Settings
          </a>

          <div className="border-t border-border my-1.5" />

          <button
            onClick={() => {
              dispatch(logout());
              window.location.href = "/login";
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors duration-150 text-left"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
