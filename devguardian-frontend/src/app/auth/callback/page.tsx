"use client";

import * as React from "react";
import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { useAppDispatch } from "@/hooks/useRedux";
import { loginWithAsgardeo } from "@/features/auth/authSlice";
import Link from "next/link";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");
    const errorDesc = searchParams.get("error_description");

    if (errorParam) {
      setError(errorDesc || errorParam || "Asgardeo authentication was cancelled or failed.");
      return;
    }

    if (!code) {
      setError("No authorization code was returned by the identity provider.");
      return;
    }

    processedRef.current = true;

    const codeVerifier = sessionStorage.getItem("asgardeo_code_verifier") || undefined;
    const redirectUri = sessionStorage.getItem("asgardeo_redirect_uri") || `${window.location.origin}/auth/callback`;

    dispatch(
      loginWithAsgardeo({
        code,
        redirectUri,
        codeVerifier,
      })
    )
      .unwrap()
      .then(() => {
        sessionStorage.removeItem("asgardeo_code_verifier");
        sessionStorage.removeItem("asgardeo_auth_state");
        window.location.href = "/dashboard";
      })
      .catch((err: any) => {
        console.error("Asgardeo exchange error:", err);
        setError(typeof err === "string" ? err : err?.message || "Failed to complete Asgardeo login.");
      });
  }, [dispatch, router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#030306] cyber-grid-bg text-white p-6">
      <div className="w-full max-w-md p-8 bg-[#090912]/90 border border-cyber-cyan/30 rounded-2xl shadow-[0_0_30px_rgba(0,240,255,0.15)] text-center flex flex-col items-center gap-5 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid-dot opacity-20 pointer-events-none" />

        {error ? (
          <>
            <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertCircle className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-orbitron tracking-tight text-white">
                Authentication Error
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                {error}
              </p>
            </div>
            <Link
              href="/login"
              className="mt-2 py-2.5 px-6 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-black font-semibold text-xs tracking-wider uppercase font-mono transition-all duration-200 shadow-md"
            >
              Return to Login
            </Link>
          </>
        ) : (
          <>
            <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.2)] animate-pulse">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-orbitron tracking-tight text-white">
                Verifying Session
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                Establishing secure identity token exchange with Asgardeo...
              </p>
            </div>
            <div className="h-5 w-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mt-2" />
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#030306] text-zinc-400 font-mono text-xs">
          Loading authentication handler...
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}

