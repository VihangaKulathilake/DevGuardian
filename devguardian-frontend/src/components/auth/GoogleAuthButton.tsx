"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import GoogleIcon from "@/components/icons/GoogleIcon";
import { useAppDispatch } from "@/hooks/useRedux";
import { loginWithGoogle } from "@/features/auth/authSlice";

declare global {
  interface Window {
    google?: any;
  }
}

export interface GoogleAuthButtonProps {
  text?: string;
  className?: string;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  text = "Continue with Google",
  className,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const hiddenBtnContainerRef = useRef<HTMLDivElement>(null);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  const handleCredentialResponse = async (response: any) => {
    if (response?.credential) {
      setLoading(true);
      try {
        await dispatch(loginWithGoogle(response.credential)).unwrap();
        window.location.href = "/dashboard";
      } catch (err) {
        console.error("Google authentication failed:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !googleClientId) return;

    const initGoogle = () => {
      if (window.google?.accounts?.id && hiddenBtnContainerRef.current) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render official hidden button so clicking our custom button can trigger native popup
        hiddenBtnContainerRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(hiddenBtnContainerRef.current, {
          type: "standard",
          theme: "filled_black",
          size: "large",
          width: 280,
        });
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const existingScript = document.getElementById("google-gsi-script");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "google-gsi-script";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initGoogle;
        document.body.appendChild(script);
      } else {
        existingScript.addEventListener("load", initGoogle);
      }
    }
  }, [googleClientId]);

  const handleGoogleClick = () => {
    if (!googleClientId) {
      alert("Please configure NEXT_PUBLIC_GOOGLE_CLIENT_ID in devguardian-frontend/.env.local");
      return;
    }

    // Trigger official Google Sign-In popup
    const nativeBtn = hiddenBtnContainerRef.current?.querySelector("div[role=button]") as HTMLElement;
    if (nativeBtn) {
      nativeBtn.click();
    } else if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setLoading(false);
        }
      });
    }
  };

  return (
    <>
      {/* Hidden container where official Google element is initialized */}
      <div ref={hiddenBtnContainerRef} className="hidden" aria-hidden="true" />

      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={loading}
        className={
          className ||
          "w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-zinc-700/70 bg-zinc-900/70 hover:bg-zinc-800/80 hover:border-zinc-600 text-zinc-200 text-sm font-medium transition-all duration-200 shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-50"
        }
      >
        {loading ? (
          <div className="h-4 w-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <GoogleIcon className="h-4.5 w-4.5 shrink-0" />
        )}
        <span>{loading ? "Signing in..." : text}</span>
      </button>
    </>
  );
};

export default GoogleAuthButton;
