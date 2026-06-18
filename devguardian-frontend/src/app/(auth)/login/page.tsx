"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, GitFork } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
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
    <div className="w-full max-w-md p-2">
      <div className="flex flex-col items-center mb-8">
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 mb-3">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-white">Welcome back</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Login to your DevGuardian workspace
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-center">
              {error}
            </div>
          )}
          <Input
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex items-center justify-between text-xs mt-1">
            <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-white transition-colors">
              <input type="checkbox" className="rounded bg-black border-border accent-primary" />
              Remember me
            </label>
            <a href="#" className="text-primary font-medium hover:underline">
              Forgot password?
            </a>
          </div>

          <Button type="submit" loading={loading} className="w-full mt-2">
            Sign In
          </Button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <span className="relative bg-card px-3 text-xs text-muted-foreground">
            Or continue with
          </span>
        </div>

        <Button variant="secondary" className="w-full flex items-center justify-center gap-2.5">
          <GitFork className="h-4 w-4" />
          Connect GitHub Account
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-6">
          New to DevGuardian?{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
}
