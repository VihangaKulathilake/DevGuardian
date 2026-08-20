"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/navbar/Sidebar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { User, Shield, GitFork, LogOut, Radio, Lock, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { logout } from "@/features/auth/authSlice";
import {
  fetchGithubRepositories,
  connectGithubAccount,
  disconnectGithubAccount,
} from "@/features/repository/repositorySlice";
import AppFooter from "@/components/common/AppFooter";

export default function SettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { isGithubConnected, githubLoading } = useAppSelector((state) => state.repo);

  React.useEffect(() => {
    dispatch(fetchGithubRepositories());
  }, [dispatch]);

  const handleConnectGithub = () => {
    dispatch(connectGithubAccount());
  };

  const handleDisconnectGithub = async () => {
    await dispatch(disconnectGithubAccount());
    dispatch(fetchGithubRepositories());
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#030306] cyber-grid-bg text-foreground">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar currentPath="/settings" />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full space-y-8">
          
          {/* Header */}
          <div className="border-b border-cyber-cyan/15 pb-6 text-left">
            <h1 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-white uppercase tracking-wider mb-2 leading-none">
              ACCOUNT & NODE SETTINGS
            </h1>
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
              Manage authenticated user identity, active GitHub integration nodes, and security sessions.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3 items-start">
            
            {/* Left & Middle Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Profile Card */}
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <User className="h-4.5 w-4.5 text-cyber-cyan" />
                    <span>Authenticated User Profile</span>
                  </div>
                }
                subtitle="Active account credentials and node identifiers."
                techCorners={true}
                className="border-cyber-cyan/15"
              >
                <div className="grid gap-6 sm:grid-cols-2 mt-2 text-left font-mono">
                  <div className="space-y-1.5 p-3.5 bg-[#0b0b14]/90 border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-orbitron">
                      DISPLAY NAME
                    </span>
                    <span className="text-xs font-bold text-white tracking-wide">
                      {user?.name || "DevGuardian User"}
                    </span>
                  </div>

                  <div className="space-y-1.5 p-3.5 bg-[#0b0b14]/90 border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-orbitron">
                      REGISTERED EMAIL
                    </span>
                    <span className="text-xs font-bold text-cyber-cyan tracking-wide">
                      {user?.email || "user@devguardian.io"}
                    </span>
                  </div>

                  <div className="space-y-1.5 p-3.5 bg-[#0b0b14]/90 border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-orbitron">
                      USER NODE ID
                    </span>
                    <span className="text-xs font-bold text-zinc-300 tracking-wide">
                      #{user?.userId || "1"}
                    </span>
                  </div>

                  <div className="space-y-1.5 p-3.5 bg-[#0b0b14]/90 border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-orbitron">
                      ACCOUNT ROLE
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="info">
                        {user?.role || "USER"}
                      </Badge>
                      <span className="text-[10px] text-zinc-400">Security Operator</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* GitHub Integration Card */}
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <GitFork className="h-4.5 w-4.5 text-cyber-purple" />
                    <span>GitHub Integration Node</span>
                  </div>
                }
                subtitle="Connect your GitHub account to import private and public codebases automatically."
                techCorners={true}
                className="border-cyber-purple/20"
              >
                <div className="space-y-4 mt-2 text-left">
                  {isGithubConnected ? (
                    <div className="p-4 bg-[#051e12]/40 border border-[#00ff66]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 border border-[#00ff66]/40 bg-[#00ff66]/10 text-[#00ff66] flex items-center justify-center shrink-0">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-orbitron font-bold text-white uppercase tracking-wider">
                              GitHub OAuth Connected
                            </span>
                            <span className="h-2 w-2 rounded-full bg-cyber-green animate-pulse" />
                          </div>
                          <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                            Your GitHub integration is active. You can clone private and public repositories and inspect branches directly.
                          </p>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleDisconnectGithub}
                        className="shrink-0 border-zinc-800 text-zinc-400 hover:text-cyber-pink hover:border-cyber-pink/40 font-mono text-xs py-2"
                      >
                        <LogOut className="h-3.5 w-3.5 mr-1.5" />
                        DISCONNECT
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 bg-[#120a1c]/40 border border-cyber-purple/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 border border-cyber-purple bg-cyber-purple/10 text-cyber-purple flex items-center justify-center shrink-0 shadow-[0_0_10px_#8f00ff35]">
                          <GitFork className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-orbitron font-bold text-white uppercase tracking-wider">
                            No GitHub Account Linked
                          </span>
                          <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                            Link your GitHub account to access private repositories, query remote branches, and import codebases seamlessly.
                          </p>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleConnectGithub}
                        className="shrink-0 border-cyber-purple/40 text-cyber-purple hover:text-white hover:border-cyber-purple shadow-[0_0_8px_#8f00ff20] font-mono text-xs py-2"
                      >
                        CONNECT GITHUB
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

            </div>

            {/* Right Column */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Security Enclave Status */}
              <Card
                title="Enclave & Session"
                subtitle="SECURITY STATUS"
                techCorners={true}
                className="border-cyber-cyan/15"
              >
                <div className="space-y-4 text-xs font-mono text-left">
                  <div className="p-3 bg-[#05050a] border border-border/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">AUTH ENGINE</span>
                      <span className="text-cyber-green text-[10px] font-bold">STATELESS JWT</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">REAL-TIME STREAM</span>
                      <span className="text-cyber-cyan text-[10px] font-bold flex items-center gap-1">
                        <Radio className="h-3 w-3 animate-pulse" />
                        WEBSOCKET ACTIVE
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">AI ASSISTANT</span>
                      <span className="text-cyber-purple text-[10px] font-bold">GEMINI 2.5 FLASH</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-black/40 border border-zinc-800 space-y-1.5 font-sans">
                    <span className="text-[10px] font-orbitron font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-cyber-cyan" />
                      Session Integrity
                    </span>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Your session token is cryptographically signed and stored securely in local browser storage.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="danger"
                    onClick={handleLogout}
                    className="w-full py-2.5 flex items-center justify-center gap-2 font-mono text-xs border-cyber-pink text-cyber-pink hover:bg-cyber-pink hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    TERMINATE SESSION
                  </Button>
                </div>
              </Card>

            </div>

          </div>

          <AppFooter />
        </main>
      </div>
    </div>
  );
}
