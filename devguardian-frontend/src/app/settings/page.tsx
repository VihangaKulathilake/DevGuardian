"use client";

import * as React from "react";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/navbar/Sidebar";

export default function SettingsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar currentPath="/settings" />
        <main className="flex-1 p-8 bg-background">
          <h1 className="text-2xl font-bold mb-2">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your DevGuardian account and profile preferences.</p>
        </main>
      </div>
    </div>
  );
}
