"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, GitFork } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { registerUser } from "@/features/auth/authSlice";

export default function RegisterPage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  React.useEffect(() => {
    if (isAuthenticated) {
      window.location.href = "/dashboard";
    }
  }, [isAuthenticated]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(registerUser({ name, email, password }));
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Icon Cockpit Header */}
      <div className="flex flex-col items-center mb-6 text-center select-none">
        <div className="h-12 w-12 rounded-none border border-cyber-pink bg-cyber-pink/10 flex items-center justify-center text-cyber-pink shadow-[0_0_15px_rgba(255,0,127,0.3)] mb-4 animate-pulse">
          <ShieldCheck className="h-7 w-7" />
        </div>
        
        <h1 className="text-lg font-orbitron font-extrabold text-white tracking-widest uppercase flex items-center gap-2">
          PROVISION ACCESS NODE
          <span className="h-2 w-2 rounded-full bg-cyber-pink animate-ping shrink-0" />
        </h1>
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">
          CREATING AUTHORIZED IDENTITIES
        </p>
      </div>

      {/* Register Form content */}
      <div className="w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 text-xs font-mono bg-cyber-pink/15 border border-cyber-pink/40 text-cyber-pink text-center tracking-wide uppercase">
              // error: {error}
            </div>
          )}
          
          <Input
            label="Full Name"
            type="text"
            placeholder="Agent John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-[#0b0b14]/90 border-zinc-800 text-zinc-200 focus:border-cyber-cyan focus:ring-cyber-cyan/30"
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="agent@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-[#0b0b14]/90 border-zinc-800 text-zinc-200 focus:border-cyber-cyan focus:ring-cyber-cyan/30"
          />
          
          <Input
            label="Security Passkey"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-[#0b0b14]/90 border-zinc-800 text-zinc-200 focus:border-cyber-cyan focus:ring-cyber-cyan/30"
          />

          <p className="text-[9px] font-mono text-zinc-500 leading-relaxed uppercase tracking-wider mt-1 select-none">
            // BY GENERATING KEY, YOU CONSENT TO SECURE POLICY PROTOCOLS AND AUDITING DIRECTIVES.
          </p>

          <Button 
            type="submit" 
            loading={loading} 
            variant="cyber"
            className="w-full mt-3 py-3 shadow-[0_0_15px_rgba(143,0,255,0.4)] relative overflow-hidden group"
          >
            <span className="relative z-10">GENERATE AUTHORIZED ID</span>
          </Button>
        </form>

        {/* Separator line */}
        <div className="relative my-7 text-center select-none font-mono">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-800" />
          </div>
          <span className="relative bg-[#07070b] px-3.5 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
            OR PROVISION WITH REPO PLATFORM
          </span>
        </div>

        {/* GitHub Sign in */}
        <Button 
          variant="secondary" 
          className="w-full flex items-center justify-center gap-2 py-3 border-zinc-800/80 hover:border-cyber-cyan hover:shadow-[0_0_10px_rgba(0,240,255,0.2)] text-zinc-300 hover:text-cyber-cyan font-mono"
        >
          <GitFork className="h-4.5 w-4.5 shrink-0" />
          SIGN UP WITH GITHUB WORKSPACE
        </Button>

        {/* Nav to login */}
        <p className="text-center text-xs font-mono text-zinc-500 mt-8 select-none">
          ALREADY AUTHORIZED AT THIS GATE?{" "}
          <Link href="/login" className="text-cyber-cyan hover:text-cyber-cyan/80 font-bold uppercase tracking-wider transition-colors ml-1.5">
            VERIFY CREDENTIALS
          </Link>
        </p>
      </div>
    </div>
  );
}
