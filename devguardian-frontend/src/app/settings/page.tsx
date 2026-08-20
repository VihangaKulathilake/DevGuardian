"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/navbar/Sidebar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { User, Shield, GitFork, LogOut, Radio, Lock, CheckCircle2, AlertTriangle, Sparkles, Cpu, Zap } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { logout } from "@/features/auth/authSlice";
import {
  fetchGithubRepositories,
  connectGithubAccount,
  disconnectGithubAccount,
} from "@/features/repository/repositorySlice";
import AppFooter from "@/components/common/AppFooter";
import { aiApi } from "@/features/ai/aiApi";
import { ModelStatus } from "@/features/ai/aiTypes";

export default function SettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { isGithubConnected, githubLoading } = useAppSelector((state) => state.repo);

  const [models, setModels] = React.useState<ModelStatus[]>([]);
  const [activeProvider, setActiveProvider] = React.useState<string>("groq");
  const [switchingModel, setSwitchingModel] = React.useState(false);

  React.useEffect(() => {
    dispatch(fetchGithubRepositories());
    loadModels();
  }, [dispatch]);

  const loadModels = async () => {
    try {
      const list = await aiApi.getAvailableModels();
      if (list && list.length > 0) {
        setModels(list);
        const active = list.find((m) => m.active);
        if (active) setActiveProvider(active.providerId);
      }
    } catch (e) {
      console.warn("Error loading models in settings:", e);
    }
  };

  const handleSwitchModel = async (providerId: string) => {
    setSwitchingModel(true);
    try {
      await aiApi.setActiveModel(providerId);
      setActiveProvider(providerId);
      await loadModels();
    } catch (e) {
      console.error("Failed to switch active model:", e);
    } finally {
      setSwitchingModel(false);
    }
  };

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
              Manage authenticated user identity, active AI model routing, GitHub integration nodes, and security sessions.
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

              {/* AI Multi-Model Routing Engine */}
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4.5 w-4.5 text-cyber-cyan" />
                    <span>AI Model Routing & Auto-Failover Engine</span>
                  </div>
                }
                subtitle="Configure primary LLM provider and automated rate-limit failover."
                techCorners={true}
                className="border-cyber-cyan/15"
              >
                <div className="space-y-4 mt-2 text-left">
                  <div className="p-3.5 bg-[#050509] border border-zinc-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-cyber-green text-xs font-bold font-orbitron">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>INTELLIGENT RATE-LIMIT FAILOVER ACTIVE</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                      If your primary AI provider reaches its rate limit (HTTP 429) or quota threshold, DevGuardian automatically routes remediation requests to your secondary backup engine with zero downtime.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Groq Card */}
                    <div className={`p-4 border transition-all ${activeProvider === "groq" ? "border-cyber-cyan bg-cyber-cyan/5 shadow-[0_0_12px_rgba(0,240,255,0.15)]" : "border-zinc-800 bg-[#0b0b14]"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-cyber-cyan" />
                          <span className="font-orbitron font-bold text-xs text-white">GROQ (LLAMA 3.3 70B)</span>
                        </div>
                        {activeProvider === "groq" ? (
                          <Badge variant="success">PRIMARY</Badge>
                        ) : (
                          <Badge variant="neutral">BACKUP</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 font-sans mb-3">
                        Ultra-fast LPU inference (500+ tokens/sec) for instant code patch synthesis.
                      </p>
                      {activeProvider !== "groq" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={switchingModel}
                          onClick={() => handleSwitchModel("groq")}
                          className="w-full font-mono text-[11px] border-zinc-700 hover:border-cyber-cyan text-zinc-300 hover:text-white"
                        >
                          SET AS PRIMARY MODEL
                        </Button>
                      )}
                    </div>

                    {/* Gemini Card */}
                    <div className={`p-4 border transition-all ${activeProvider === "gemini" ? "border-cyber-purple bg-cyber-purple/5 shadow-[0_0_12px_rgba(143,0,255,0.15)]" : "border-zinc-800 bg-[#0b0b14]"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-cyber-purple" />
                          <span className="font-orbitron font-bold text-xs text-white">GOOGLE GEMINI 2.0 FLASH</span>
                        </div>
                        {activeProvider === "gemini" ? (
                          <Badge variant="info">PRIMARY</Badge>
                        ) : (
                          <Badge variant="neutral">BACKUP</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 font-sans mb-3">
                        Advanced AST reasoning and deep context code vulnerability auditing.
                      </p>
                      {activeProvider !== "gemini" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={switchingModel}
                          onClick={() => handleSwitchModel("gemini")}
                          className="w-full font-mono text-[11px] border-zinc-700 hover:border-cyber-purple text-zinc-300 hover:text-white"
                        >
                          SET AS PRIMARY MODEL
                        </Button>
                      )}
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
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">PRIMARY AI</span>
                      <span className="text-cyber-purple text-[10px] font-bold uppercase">
                        {activeProvider === "gemini" ? "GEMINI 2.0 FLASH" : "GROQ LLAMA 3.3"}
                      </span>
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
