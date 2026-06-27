"use client";

import * as React from "react";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/navbar/Sidebar";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { User, Shield, Key, Sliders, CheckCircle, Copy, Check } from "lucide-react";
import { useAppSelector } from "@/hooks/useRedux";

export default function SettingsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [apiKey, setApiKey] = React.useState("dg_live_83a1f9e2d3b45a6c7e8f90a1b2c3d4e5");
  const [showKey, setShowKey] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);

  // High tech custom toggles state
  const [autoScan, setAutoScan] = React.useState(true);
  const [dailyReports, setDailyReports] = React.useState(true);

  React.useEffect(() => {
    if (user) {
      setName(user.name || "Dev Guardian");
      setEmail(user.email || "admin@devguardian.io");
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#030306] cyber-grid-bg text-foreground">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar currentPath="/settings" />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full space-y-8">
          
          {/* Header */}
          <div className="border-b border-cyber-cyan/15 pb-6">
            <h1 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-white uppercase tracking-wider mb-2 leading-none">
              SYSTEM PREFERENCES
            </h1>
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
              Configure profile nodes, cryptographic access keys, and scanner directives.
            </p>
          </div>

          <form onSubmit={handleSave} className="grid gap-8 lg:grid-cols-3 items-start">
            
            {/* Left & Middle Column (Main Settings Cards) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Profile Card */}
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <User className="h-4.5 w-4.5 text-cyber-cyan" />
                    <span>User Profile Nodes</span>
                  </div>
                }
                subtitle="Update account settings and node identifiers."
                techCorners={true}
                className="border-cyber-cyan/15"
              >
                <div className="grid gap-6 sm:grid-cols-2 mt-2">
                  <Input
                    label="NODE IDENTIFIER / NAME"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-[#0b0b14]/90 border-zinc-800 focus:border-cyber-cyan text-zinc-200"
                  />
                  <Input
                    label="AUTH ROUTING EMAIL ADDRESS"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-[#0b0b14]/90 border-zinc-800 focus:border-cyber-cyan text-zinc-200"
                  />
                </div>
              </Card>

              {/* Cryptographic Keys section */}
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <Key className="h-4.5 w-4.5 text-cyber-cyan" />
                    <span>Cryptographic CLI Access Keys</span>
                  </div>
                }
                subtitle="Credential string utilized to authenticate local and CI build environment scans."
                techCorners={true}
                className="border-cyber-cyan/15"
              >
                <div className="space-y-4 mt-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-orbitron font-bold text-zinc-400 uppercase tracking-wider block">
                      CLI AUTHENTICATION TOKEN
                    </label>
                    
                    {/* Glowing cryptographic token panel */}
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                      <div className="flex-1 bg-black/60 border border-zinc-800 px-4 py-3 flex items-center justify-between font-mono text-xs select-all text-left">
                        <span className={`tracking-wider ${showKey ? 'text-cyber-yellow' : 'text-zinc-500'}`}>
                          {showKey ? apiKey : "dg_live_••••••••••••••••••••••••••••••••"}
                        </span>
                        
                        <div className="flex items-center gap-1.5 shrink-0 ml-4">
                          <button
                            type="button"
                            onClick={handleCopy}
                            title="Copy Key"
                            className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          >
                            {copied ? (
                              <Check className="h-4 w-4 text-cyber-green" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="px-5 shrink-0 border-zinc-800/80 hover:border-cyber-cyan"
                          onClick={() => setShowKey(!showKey)}
                        >
                          {showKey ? "MASK KEY" : "REVEAL KEY"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500 bg-[#0b0b14] border border-border/40 px-3.5 py-2">
                    <span className="font-bold text-zinc-400 uppercase">ACCESS MATRIX:</span>
                    <Badge variant="success">Read / Write Access</Badge>
                    <span className="text-zinc-700">|</span>
                    <span>KEY TYPE: HMAC-SHA256</span>
                    <span className="text-zinc-700">|</span>
                    <span>CREATED: 3 DAYS AGO</span>
                  </div>
                </div>
              </Card>

              {/* Advanced Scanning Preferences */}
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <Sliders className="h-4.5 w-4.5 text-cyber-cyan" />
                    <span>Scanning Policies & Directives</span>
                  </div>
                }
                subtitle="Configure operational triggers for threat auditing."
                techCorners={true}
                className="border-cyber-cyan/15"
              >
                <div className="grid gap-4 mt-2 font-mono text-xs">
                  {/* Custom Cyber Toggle 1 */}
                  <div 
                    onClick={() => setAutoScan(!autoScan)}
                    className="flex items-center justify-between border border-zinc-800 bg-[#0b0b14]/80 p-4 hover:border-cyber-cyan/35 transition-all duration-300 cursor-pointer select-none group"
                  >
                    <div className="flex flex-col pr-4 text-left">
                      <span className="text-xs font-orbitron font-bold text-white uppercase tracking-wider group-hover:text-cyber-cyan transition-colors">
                        Auto-scan Pull Requests
                      </span>
                      <span className="text-[11px] text-zinc-500 font-sans mt-1 leading-relaxed">
                        Trigger static analysis checks instantly for security vulnerabilities on every incoming PR.
                      </span>
                    </div>
                    <button 
                      type="button" 
                      className={`w-12 h-6 flex items-center p-1 cursor-pointer transition-colors duration-300 shrink-0 ${autoScan ? 'bg-cyber-cyan/90' : 'bg-zinc-900 border border-zinc-800'}`}
                      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
                    >
                      <div className={`bg-black w-4 h-4 transition-transform duration-300 ${autoScan ? 'translate-x-6 bg-black' : 'translate-x-0 bg-zinc-600'}`} />
                    </button>
                  </div>

                  {/* Custom Cyber Toggle 2 */}
                  <div 
                    onClick={() => setDailyReports(!dailyReports)}
                    className="flex items-center justify-between border border-zinc-800 bg-[#0b0b14]/80 p-4 hover:border-cyber-cyan/35 transition-all duration-300 cursor-pointer select-none group"
                  >
                    <div className="flex flex-col pr-4 text-left">
                      <span className="text-xs font-orbitron font-bold text-white uppercase tracking-wider group-hover:text-cyber-cyan transition-colors">
                        Daily Summary Reports
                      </span>
                      <span className="text-[11px] text-zinc-500 font-sans mt-1 leading-relaxed">
                        Generate automated daily security audit sheets directly to your communications channels.
                      </span>
                    </div>
                    <button 
                      type="button" 
                      className={`w-12 h-6 flex items-center p-1 cursor-pointer transition-colors duration-300 shrink-0 ${dailyReports ? 'bg-cyber-cyan/90' : 'bg-zinc-900 border border-zinc-800'}`}
                      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
                    >
                      <div className={`bg-black w-4 h-4 transition-transform duration-300 ${dailyReports ? 'translate-x-6 bg-black' : 'translate-x-0 bg-zinc-600'}`} />
                    </button>
                  </div>
                </div>
              </Card>

            </div>

            {/* Right Column (Control Panel Details) */}
            <div className="lg:col-span-1">
              <Card
                title="System Control Console"
                subtitle="ACTIONS OVERSEER"
                techCorners={true}
                className="border-cyber-pink/15"
              >
                <div className="space-y-6">
                  {/* Status Panel Details */}
                  <div className="bg-[#05050a] border border-border/80 p-4 space-y-3 relative overflow-hidden font-sans">
                    <div className="flex gap-3 text-left">
                      <Shield className="h-5 w-5 text-cyber-cyan shrink-0 mt-0.5 animate-pulse" />
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold font-orbitron text-white uppercase tracking-widest block">NODE CREDENTIAL INTEGRITY</span>
                        <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                          All settings changes are written back and signed with local session security tokens automatically.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Console */}
                  <div className="space-y-3">
                    {isSaved && (
                      <div className="flex items-center gap-2.5 text-cyber-green text-xs font-mono bg-[#051e12]/60 border border-cyber-green/35 px-4 py-3 select-none">
                        <CheckCircle className="h-4.5 w-4.5 shrink-0 text-cyber-green" />
                        <span className="uppercase tracking-wider font-bold">[ OK ] CONFIGURATION NODE REBUILT</span>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      variant="primary"
                      className="w-full py-3 shadow-[0_0_15px_rgba(0,240,255,0.45)] flex items-center justify-center gap-1.5"
                    >
                      COMMIT REBUILDS
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

          </form>
        </main>
      </div>
    </div>
  );
}
