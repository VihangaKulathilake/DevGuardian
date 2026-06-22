"use client";

import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { initializeAuth } from "@/features/auth/authSlice";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/useRedux";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const isAuthRoute = pathname === "/" || pathname === "/login" || pathname === "/register";

    if (!token && !isAuthRoute) {
      // User is not logged in and trying to access a protected page
      router.replace("/login");
    } else if (token && isAuthRoute && pathname !== "/") {
      // User is logged in and trying to access login/register page
      router.replace("/dashboard");
    } else {
      setChecked(true);
    }
  }, [pathname, router]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-[25%] left-[25%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            Securing Workspace...
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(initializeAuth());
  }, []);

  return (
    <Provider store={store}>
      <AuthGuard>{children}</AuthGuard>
    </Provider>
  );
}
