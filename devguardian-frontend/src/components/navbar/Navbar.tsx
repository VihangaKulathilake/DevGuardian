import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import UserProfileDropdown from "./UserProfileDropdown";
import NotificationDropdown from "./NotificationDropdown";
import { ShieldAlert, Search, GitBranch, Terminal } from "lucide-react";
import Input from "../ui/Input";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchRepositories } from "@/features/repository/repositorySlice";


export const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Redux state for linked repositories
  const { repositories } = useAppSelector((state) => state.repo);

  // Local state for search queries and dropdown open/close states
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch repositories on mount if not already loaded
  useEffect(() => {
    if (repositories.length === 0) {
      dispatch(fetchRepositories());
    }
  }, [dispatch, repositories.length]);

  // Click outside listener to automatically close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter repositories based on name or language match
  const filteredRepos = repositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.language && repo.language.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const handleSelectRepo = (repoId: number) => {
    setIsOpen(false);
    setSearchQuery("");
    router.push(`/analysis?repoId=${repoId}`);
  };

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
      <div ref={containerRef} className="hidden md:flex max-w-sm w-full relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 z-10" />
        <Input
          placeholder="SEARCH SYSTEM DIRECTORY..."
          className="pl-10 py-2 bg-black/45 text-[10px] uppercase font-mono tracking-wider border-border/80"
          mono={true}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />

        {/* Cyber Search Dropdown Overlay */}
        {isOpen && searchQuery && (
          <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#07070c]/95 backdrop-blur-md border border-cyber-cyan/30 shadow-[0_4px_20px_rgba(0,240,255,0.15)] z-50 text-left font-mono select-none">
            {/* Header Matrix label */}
            <div className="px-4 py-2 border-b border-cyber-cyan/15 bg-black/35 text-[8px] font-bold text-cyber-cyan/60 tracking-widest uppercase">
              SYSTEM TARGET INDEX
            </div>

            {/* Results container */}
            <div className="max-h-60 overflow-y-auto scrollbar-thin">
              {filteredRepos.length === 0 ? (
                <div className="px-4 py-4 text-[10px] text-zinc-500 uppercase text-center">
                  // NO DIRECTORY MATCHES FOUND
                </div>
              ) : (
                filteredRepos.map((repo) => (
                  <button
                    key={repo.id}
                    onClick={() => handleSelectRepo(repo.id)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-cyber-cyan/5 border-b border-zinc-900/50 last:border-b-0 group transition-colors duration-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-7 w-7 border border-zinc-800 bg-[#0c0c14] group-hover:border-cyber-cyan/40 text-muted-foreground group-hover:text-cyber-cyan flex items-center justify-center shrink-0 transition-colors">
                        <GitBranch className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-bold text-white group-hover:text-cyber-cyan truncate transition-colors">
                          {repo.name.toUpperCase()}
                        </span>
                        <span className="text-[8px] text-zinc-500 uppercase truncate">
                          {repo.language || "Unknown Language"} • {repo.branch || "main"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 text-cyber-cyan text-[8px] font-bold tracking-widest transition-opacity shrink-0">
                      <span>AUDIT</span>
                      <Terminal className="h-3 w-3" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
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

