"use client";

import * as React from "react";
import { useState } from "react";
import AsgardeoIcon from "@/components/icons/AsgardeoIcon";

function generateRandomString(length: number): string {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let text = "";
  if (typeof window !== "undefined" && window.crypto) {
    const values = new Uint8Array(length);
    window.crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      text += possible[values[i] % possible.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
  }
  return text;
}

async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  const base64Digest = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return base64Digest;
}

export interface AsgardeoAuthButtonProps {
  text?: string;
  className?: string;
}

export const AsgardeoAuthButton: React.FC<AsgardeoAuthButtonProps> = ({
  text = "Continue with Asgardeo",
  className,
}) => {
  const [loading, setLoading] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_ASGARDEO_CLIENT_ID || "";
  const baseUrl = process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL || "https://api.asgardeo.io/t/orge1hf1";

  const handleAsgardeoLogin = async () => {
    if (!clientId) {
      alert("Please configure NEXT_PUBLIC_ASGARDEO_CLIENT_ID in devguardian-frontend/.env.local");
      return;
    }

    setLoading(true);

    try {
      const codeVerifier = generateRandomString(64);
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = generateRandomString(32);

      sessionStorage.setItem("asgardeo_code_verifier", codeVerifier);
      sessionStorage.setItem("asgardeo_auth_state", state);

      const redirectUri = `${window.location.origin}/auth/callback`;
      sessionStorage.setItem("asgardeo_redirect_uri", redirectUri);

      const authEndpoint = baseUrl.replace(/\/+$/, "") + "/oauth2/authorize";
      const params = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        scope: "openid profile email",
        redirect_uri: redirectUri,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        state: state,
      });

      window.location.href = `${authEndpoint}?${params.toString()}`;
    } catch (err) {
      console.error("Failed to initiate Asgardeo authentication:", err);
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleAsgardeoLogin}
      disabled={loading}
      className={
        className ||
        "w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-zinc-700/70 bg-zinc-900/70 hover:bg-zinc-800/80 hover:border-orange-500/50 text-zinc-200 text-sm font-medium transition-all duration-200 shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-50"
      }
    >
      {loading ? (
        <div className="h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      ) : (
        <AsgardeoIcon className="h-4.5 w-4.5 shrink-0" />
      )}
      <span>{loading ? "Connecting to Asgardeo..." : text}</span>
    </button>
  );
};

export default AsgardeoAuthButton;

