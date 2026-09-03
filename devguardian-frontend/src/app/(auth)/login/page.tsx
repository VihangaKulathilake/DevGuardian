"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { loginUser } from "@/features/auth/authSlice";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
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
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.15)] mb-3.5">
          <ShieldCheck className="h-6 w-6" />
        </div>
        
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Sign in to your DevGuardian account
        </p>
      </div>

      {/* Google Login Button */}
      <GoogleAuthButton text="Continue with Google" />

      {/* Divider */}
      <div className="relative w-full my-6 text-center select-none">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-800" />
        </div>
        <span className="relative bg-[#0c0e18] px-3 text-xs text-zinc-500 font-medium">
          or continue with email
        </span>
      </div>

      {/* Login Form */}
      <div className="w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}
          
          {/* Email field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
            </div>
          </div>
          
          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300">
                Password
              </label>
              <a href="#" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between text-xs select-none mt-0.5">
            <label className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-zinc-300 transition-colors">
              <input 
                type="checkbox" 
                className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-cyan-500/30 focus:ring-offset-0 cursor-pointer accent-cyan-400" 
              />
              Remember me
            </label>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-black font-semibold text-sm transition-all duration-200 shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Navigation to register */}
        <p className="text-center text-sm text-zinc-400 mt-6 select-none">
          Don't have an account?{" "}
          <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors ml-1">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
