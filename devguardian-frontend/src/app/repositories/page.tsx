"use client";

import * as React from "react";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/navbar/Sidebar";
import RepositoryList from "@/components/dashboard/RepositoryList";

export default function RepositoriesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar currentPath="/repositories" />
        <main className="flex-1 p-8 bg-background">
          <h1 className="text-2xl font-bold mb-6">Repositories</h1>
          <RepositoryList />
        </main>
      </div>
    </div>
  );
}
