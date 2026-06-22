"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/navbar/Sidebar";
import RepositoryList from "@/components/dashboard/RepositoryList";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { Plus, GitBranch, Sparkles, GitFork, Search, Link2, LogOut } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  addRepository,
  fetchGithubRepositories,
  connectGithubAccount,
  importGithubRepository,
  disconnectGithubAccount,
} from "@/features/repository/repositorySlice";

export default function RepositoriesPage() {
  const dispatch = useAppDispatch();
  const {
    repositories,
    githubRepositories,
    isGithubConnected,
    githubLoading,
  } = useAppSelector((state) => state.repo);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"github" | "custom">("github");
  
  // Custom URL Form State
  const [repoUrl, setRepoUrl] = useState("");
  const [customName, setCustomName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // GitHub import search state
  const [githubSearchQuery, setGithubSearchQuery] = useState("");

  // Load connection state on page mount
  useEffect(() => {
    dispatch(fetchGithubRepositories());
  }, [dispatch]);

  // Load repositories on modal open
  useEffect(() => {
    if (isAddModalOpen) {
      dispatch(fetchGithubRepositories());
    }
  }, [isAddModalOpen, dispatch]);

  const handleAddRepoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const urlParts = repoUrl.trim().split("/");
      const extractedName = customName.trim() || urlParts[urlParts.length - 1]?.replace(".git", "") || "repo";

      const resultAction = await dispatch(
        addRepository({
          name: extractedName,
          url: repoUrl,
          provider: "OTHER",
          visibility: "PRIVATE",
          branch: "main",
          language: "TypeScript",
          type: "BACKEND",
          scanFrequency: "DAILY",
        })
      );

      if (addRepository.fulfilled.match(resultAction)) {
        setIsAddModalOpen(false);
        setRepoUrl("");
        setCustomName("");
      }
    } catch (err) {
      console.error("Failed to add repository:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportGithubRepo = async (githubRepoId: number) => {
    setIsSubmitting(true);
    try {
      const resultAction = await dispatch(importGithubRepository(githubRepoId));
      if (importGithubRepository.fulfilled.match(resultAction)) {
        setIsAddModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to import repository:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConnectGithub = () => {
    dispatch(connectGithubAccount());
  };

  const handleDisconnectGithub = () => {
    if (confirm("Are you sure you want to disconnect your GitHub integration?")) {
      dispatch(disconnectGithubAccount());
    }
  };

  // Filter out repositories that are already imported by matching URLs
  const unimportedRepos = githubRepositories.filter((gRepo) => {
    const isAlreadyImported = repositories.some(
      (r) => r.url === gRepo.clone_url || r.url === gRepo.html_url
    );
    const matchesSearch = gRepo.name.toLowerCase().includes(githubSearchQuery.toLowerCase()) ||
      (gRepo.full_name && gRepo.full_name.toLowerCase().includes(githubSearchQuery.toLowerCase()));
    return !isAlreadyImported && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar currentPath="/repositories" />
        <main className="flex-1 p-6 md:p-8 bg-background overflow-y-auto">
          
          {/* GitHub Connection Banner (Top alert) */}
          {!isGithubConnected && !githubLoading && (
            <div className="mb-6 p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300 text-left">
              <div className="flex gap-3 items-start">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0 h-10 w-10 flex items-center justify-center">
                  <GitFork className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h4 className="text-xs font-semibold text-white">Link GitHub Account</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed max-w-2xl">
                    Unlock full automation. Connect your GitHub account to import repositories directly, auto-configure scanners on pull requests, and commit secure fixes back to your codebase.
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="shrink-0 border-indigo-500/20 text-indigo-300 hover:text-white"
                onClick={handleConnectGithub}
              >
                Connect GitHub
              </Button>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="text-left">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Linked Repositories
                </h1>
                {isGithubConnected && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    GitHub Synced
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Manage and configure security scans for your code repositories.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isGithubConnected && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDisconnectGithub}
                  className="border-border hover:bg-destructive/10 hover:text-destructive flex items-center gap-1.5"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Disconnect
                </Button>
              )}
              <Button
                onClick={() => {
                  setIsAddModalOpen(true);
                  setActiveTab(isGithubConnected ? "github" : "custom");
                }}
                className="shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Add Repository
              </Button>
            </div>
          </div>

          {/* Repo Grid */}
          <section className="w-full">
            <RepositoryList />
          </section>

          {/* Connect Repository Modal */}
          <Modal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            title={
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <GitBranch className="h-4 w-4" />
                </div>
                <span>Connect Repository</span>
              </div>
            }
            size="lg"
          >
            {/* Modal Tabs */}
            <div className="flex border-b border-border mb-5">
              <button
                type="button"
                onClick={() => setActiveTab("github")}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
                  activeTab === "github"
                    ? "border-primary text-white"
                    : "border-transparent text-muted-foreground hover:text-white"
                }`}
              >
                <GitFork className="h-3.5 w-3.5" />
                Import from GitHub
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("custom")}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
                  activeTab === "custom"
                    ? "border-primary text-white"
                    : "border-transparent text-muted-foreground hover:text-white"
                }`}
              >
                <Link2 className="h-3.5 w-3.5" />
                Custom Git URL
              </button>
            </div>

            {/* TAB CONTENT: GitHub Import */}
            {activeTab === "github" && (
              <div className="flex flex-col gap-4 text-left">
                {!isGithubConnected ? (
                  // Connected State Fallback inside Modal
                  <div className="flex flex-col items-center justify-center text-center p-8 bg-zinc-950/40 border border-border/80 rounded-2xl gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shadow-lg">
                      <GitFork className="h-7 w-7" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">OAuth Integration Required</h4>
                      <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                        Connect your profile workspace with GitHub to search and load your projects instantly from active codebases.
                      </p>
                    </div>
                    <Button onClick={handleConnectGithub} className="w-full sm:w-auto">
                      Link GitHub Account
                    </Button>
                  </div>
                ) : (
                  // Connected GitHub Repository List
                  <div className="flex flex-col gap-4">
                    {/* Repository search and metadata */}
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                      <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                          type="text"
                          value={githubSearchQuery}
                          onChange={(e) => setGithubSearchQuery(e.target.value)}
                          placeholder="Search GitHub repositories..."
                          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-950/50 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-muted-foreground shrink-0 uppercase tracking-wider">
                        {unimportedRepos.length} Repositories Available
                      </span>
                    </div>

                    {/* Repository rows list */}
                    {githubLoading ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="h-7 w-7 border-2 border-primary border-t-transparent animate-spin rounded-full" />
                        <span className="text-xs text-muted-foreground">Loading repositories...</span>
                      </div>
                    ) : unimportedRepos.length === 0 ? (
                      <div className="text-center py-12 text-xs text-muted-foreground border border-dashed border-border rounded-xl bg-card/10">
                        {githubSearchQuery ? "No matching repositories found." : "All your GitHub repositories have already been imported!"}
                      </div>
                    ) : (
                      <div className="flex flex-col border border-border rounded-xl overflow-hidden max-h-[300px] overflow-y-auto bg-black/25">
                        {unimportedRepos.map((repo, idx) => (
                          <div
                            key={repo.id}
                            className={`flex items-center justify-between gap-4 p-3 text-xs ${
                              idx !== unimportedRepos.length - 1 ? "border-b border-border/50" : ""
                            } hover:bg-zinc-950/40 transition-colors`}
                          >
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="font-semibold text-white truncate">{repo.name}</span>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                <span>{repo.default_branch || "main"}</span>
                                <span>•</span>
                                <span>{repo.private ? "Private" : "Public"}</span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleImportGithubRepo(repo.id)}
                              loading={isSubmitting}
                              className="h-8 shadow-sm"
                            >
                              Import
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: Custom Git URL */}
            {activeTab === "custom" && (
              <form onSubmit={handleAddRepoSubmit} className="flex flex-col gap-5 text-left">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Enter the remote Git URL of any hosted repository manually (e.g. GitHub, GitLab, or Bitbucket) to setup static analysis.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Repository Display Name"
                    placeholder="e.g. core-api"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                  />
                  <Input
                    label="Remote Git clone URL"
                    placeholder="https://github.com/owner/repository"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    required
                  />
                </div>

                <div className="p-3 bg-secondary rounded-xl border border-border flex items-start gap-3">
                  <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-white">Manual Auto-Scan Profile</span>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Manual imports configuration will require scheduling scans or run CLI audits using API tokens.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" loading={isSubmitting}>
                    Link & Scan Repository
                  </Button>
                </div>
              </form>
            )}
          </Modal>
        </main>
      </div>
    </div>
  );
}
