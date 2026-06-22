"use client";

import * as React from "react";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/navbar/Sidebar";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { User, Shield, Key, Sliders, CheckCircle } from "lucide-react";
import { useAppSelector } from "@/hooks/useRedux";

export default function SettingsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [apiKey, setApiKey] = React.useState("dg_live_83a1f9e2d3b45a6c7e8f90a1b2c3d4e5");
  const [showKey, setShowKey] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setName(user.name || "Dev Guardian");
      setEmail(user.email || "admin@devguardian.io");
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar currentPath="/settings" />
        <main className="flex-1 p-6 md:p-8 bg-background overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
              Settings
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your profile, system settings, and API authentication.
            </p>
          </div>

          <form onSubmit={handleSave} className="grid gap-6 max-w-4xl">
            {/* Profile Settings */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <User className="h-4.5 w-4.5 text-primary" />
                  <span>Profile Information</span>
                </div>
              }
              subtitle="Update your user details and contact addresses."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </Card>

            {/* API Access Settings */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <Key className="h-4.5 w-4.5 text-primary" />
                  <span>API Keys & Authentication</span>
                </div>
              }
              subtitle="Use this API token to integrate DevGuardian CLI scans into your CI/CD workflow."
            >
              <div className="flex flex-col gap-3">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      label="CLI Authentication Token"
                      type={showKey ? "text" : "password"}
                      value={apiKey}
                      readOnly
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-[38px] shrink-0"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? "Hide" : "Reveal"}
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span>API Scope:</span>
                  <Badge variant="success">Read/Write</Badge>
                  <span>•</span>
                  <span>Created: 3 days ago</span>
                </div>
              </div>
            </Card>

            {/* Scan Configuration Preferences */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <Sliders className="h-4.5 w-4.5 text-primary" />
                  <span>Scanning Preferences</span>
                </div>
              }
              subtitle="Configure automated code scanning behavior."
            >
              <div className="flex flex-col gap-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded bg-black border-border accent-primary mt-1"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">Auto-scan Pull Requests</span>
                    <p className="text-xs text-muted-foreground">
                      Trigger scan scans instantly for security on every new PR event.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded bg-black border-border accent-primary mt-1"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">Daily Summary Reports</span>
                    <p className="text-xs text-muted-foreground">
                      Receive an automated daily security update and reports direct in your email inbox.
                    </p>
                  </div>
                </label>
              </div>
            </Card>

            {/* Actions Panel */}
            <div className="flex items-center justify-between mt-4">
              {isSaved ? (
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                  <CheckCircle className="h-4 w-4" />
                  Settings saved successfully
                </div>
              ) : (
                <div />
              )}
              <Button type="submit" className="w-full sm:w-auto px-8 shadow-lg shadow-primary/20">
                Save All Changes
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
