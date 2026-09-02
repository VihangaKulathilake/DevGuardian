"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, GitFork } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { loginUser } from "@/features/auth/authSlice";

export default function LoginPage() {
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
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header */}
      <div className="flex flex-col items-center mb-6 text-center select-none">
        <div className="h-12 w-12 rounded-none border border-cyber-cyan bg-cyber-cyan/10 flex items-center justify-center text-cyber-cyan shadow-[0_0_15px_rgba(0,240,255,0.3)] mb-4 animate-pulse">
          <ShieldCheck className="h-7 w-7" />
        </div>
        
        <h1 className="text-lg font-orbitron font-extrabold text-white tracking-widest uppercase flex items-center gap-2">
          Sign In
          <span className="h-2 w-2 rounded-full bg-cyber-cyan animate-ping shrink-0" />
        </h1>
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">
          Welcome back to DevGuardian
        </p>
      </div>

      {/* Login Form */}
      <div className="w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="p-3 text-xs font-mono bg-cyber-pink/15 border border-cyber-pink/40 text-cyber-pink text-center tracking-wide uppercase">
              // error: {error}
            </div>
          )}
          
          <Input
            label="Email Address"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-[#0b0b14]/90 border-zinc-800 text-zinc-200 focus:border-cyber-cyan focus:ring-cyber-cyan/30"
          />
          
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-[#0b0b14]/90 border-zinc-800 text-zinc-200 focus:border-cyber-cyan focus:ring-cyber-cyan/30"
          />

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between text-[11px] font-mono mt-1 select-none">
            <label className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-white transition-colors">
              <input 
                type="checkbox" 
                className="h-3.5 w-3.5 rounded-none bg-black border border-zinc-700 accent-cyber-cyan focus:ring-0 cursor-pointer" 
              />
              Remember me
            </label>
            <a href="#" className="text-cyber-cyan hover:text-cyber-cyan/80 font-bold tracking-wider uppercase transition-colors">
              Forgot password?
            </a>
          </div>

          <Button 
            type="submit" 
            loading={loading} 
            variant="primary"
            className="w-full mt-3 py-3 shadow-[0_0_15px_rgba(0,240,255,0.4)] relative overflow-hidden group"
          >
            <span className="relative z-10">Sign In</span>
          </Button>
        </form>

        {/* Separator */}
        <div className="relative my-7 text-center select-none font-mono">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-800" />
          </div>
          <span className="relative bg-[#07070b] px-3.5 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
            OR CONTINUE WITH
          </span>
        </div>

        {/* GitHub Sign in */}
        <Button 
          variant="secondary" 
          className="w-full flex items-center justify-center gap-2 py-3 border-zinc-800/80 hover:border-cyber-cyan hover:shadow-[0_0_10px_rgba(0,240,255,0.2)] text-zinc-300 hover:text-cyber-cyan font-mono"
        >
          <GitFork className="h-4.5 w-4.5 shrink-0" />
          Continue with GitHub
        </Button>

        {/* Nav to registration */}
        <p className="text-center text-xs font-mono text-zinc-500 mt-8 select-none">
          Don't have an account?{" "}
          <Link href="/register" className="text-cyber-pink hover:text-cyber-pink/80 font-bold uppercase tracking-wider transition-colors ml-1.5">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
