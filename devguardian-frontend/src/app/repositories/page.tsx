"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/navbar/Sidebar";
import RepositoryList from "@/components/dashboard/RepositoryList";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { Plus, GitBranch, Sparkles, GitFork, Search, Link2, LogOut, Upload, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { repositoryApi } from "@/features/repository/repositoryApi";
import {
  fetchRepositories,
  addRepository,
  fetchGithubRepositories,
  connectGithubAccount,
  importGithubRepository,
  disconnectGithubAccount,
  uploadRepository,
} from "@/features/repository/repositorySlice";
import { fetchDashboardSummary } from "@/features/analysis/analysisSlice";
import AppFooter from "@/components/common/AppFooter";

export default function RepositoriesPage() {
  const dispatch = useAppDispatch();
  const {
    repositories,
    loading: repoLoading,
    error: repoError,
    githubRepositories,
    isGithubConnected,
    githubLoading,
  } = useAppSelector((state) => state.repo);

  const {
    dashboardSummary,
    loading: analysisLoading,
  } = useAppSelector((state) => state.analysis);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"github" | "url" | "upload">("github");
  const [importingRepoId, setImportingRepoId] = useState<number | null>(null);

  // Remote Git URL Form State
  const [repoUrl, setRepoUrl] = useState("");
  const [customName, setCustomName] = useState("");
  const [urlBranch, setUrlBranch] = useState("main");
  const [urlLanguage, setUrlLanguage] = useState("Auto");
  const [discoveredBranches, setDiscoveredBranches] = useState<string[]>([]);
  const [isDiscoveringBranches, setIsDiscoveringBranches] = useState(false);
  const [branchDiscoveryError, setBranchDiscoveryError] = useState<string | null>(null);

  // Initial Data Fetch on Mount
  useEffect(() => {
    dispatch(fetchRepositories());
    dispatch(fetchDashboardSummary());
    dispatch(fetchGithubRepositories());
  }, [dispatch]);

  // Auto-discover branches when repoUrl changes
  useEffect(() => {
    const trimmedUrl = repoUrl.trim();
    if (!trimmedUrl || (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://"))) {
      setDiscoveredBranches([]);
      setBranchDiscoveryError(null);
      return;
    }

    // Auto-fill module name if blank
    const urlParts = trimmedUrl.split("/");
    const lastPart = urlParts[urlParts.length - 1]?.replace(".git", "");
    if (lastPart && !customName) {
      setCustomName(lastPart);
    }

    const timer = setTimeout(async () => {
      setIsDiscoveringBranches(true);
      setBranchDiscoveryError(null);
      try {
        const res = await repositoryApi.getRemoteBranches(trimmedUrl);
        if (res && res.branches && res.branches.length > 0) {
          setDiscoveredBranches(res.branches);
          setUrlBranch(res.defaultBranch || res.branches[0]);
        }
      } catch (err: any) {
        setDiscoveredBranches([]);
        const errorMsg = err.response?.data?.message || "Failed to query branches from remote repository.";
        setBranchDiscoveryError(errorMsg);
      } finally {
        setIsDiscoveringBranches(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [repoUrl]);

  // ZIP Upload Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadBranch, setUploadBranch] = useState("main");
  const [uploadLanguage, setUploadLanguage] = useState("Auto");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("name", uploadName.trim() || uploadFile.name.replace(".zip", ""));
      formData.append("branch", uploadBranch.trim() || "main");
      formData.append("language", uploadLanguage.trim() || "Auto");

      const resultAction = await dispatch(uploadRepository(formData));
      if (uploadRepository.fulfilled.match(resultAction)) {
        setIsAddModalOpen(false);
        setUploadFile(null);
        setUploadName("");
        setUploadBranch("main");
        setUploadLanguage("Auto");
        dispatch(fetchRepositories());
        dispatch(fetchDashboardSummary());
      }
    } catch (err) {
      console.error("Failed to upload ZIP archive:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // GitHub import search state
  const [githubSearchQuery, setGithubSearchQuery] = useState("");

  // Reload GitHub repositories when modal opens
  useEffect(() => {
    if (isAddModalOpen) {
      dispatch(fetchGithubRepositories());
    }
  }, [isAddModalOpen, dispatch]);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const urlParts = repoUrl.trim().split("/");
      const extractedName = customName.trim() || urlParts[urlParts.length - 1]?.replace(".git", "") || "url-repo";
      const isGithub = repoUrl.includes("github.com");
      const isGitlab = repoUrl.includes("gitlab.com");
      const isBitbucket = repoUrl.includes("bitbucket.org");
      const detectedProvider = isGithub ? "GITHUB" : isGitlab ? "GITLAB" : isBitbucket ? "BITBUCKET" : "OTHER";

      const resultAction = await dispatch(
        addRepository({
          name: extractedName,
          url: repoUrl.trim(),
          provider: detectedProvider,
          visibility: "PUBLIC",
          branch: urlBranch.trim() || "main",
          language: urlLanguage.trim() || "Auto",
          type: "GIT",
          scanFrequency: "DAILY",
        })
      );

      if (addRepository.fulfilled.match(resultAction)) {
        setIsAddModalOpen(false);
        setRepoUrl("");
        setCustomName("");
        setUrlBranch("main");
        setUrlLanguage("Auto");
        dispatch(fetchRepositories());
        dispatch(fetchDashboardSummary());
      }
    } catch (err) {
      console.error("Failed to add remote repository:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportGithubRepo = async (githubRepoId: number) => {
    setImportingRepoId(githubRepoId);
    try {
      const resultAction = await dispatch(importGithubRepository(githubRepoId));
      if (importGithubRepository.fulfilled.match(resultAction)) {
        setIsAddModalOpen(false);
        dispatch(fetchRepositories());
        dispatch(fetchDashboardSummary());
      }
    } catch (err) {
      console.error("Failed to import repository:", err);
    } finally {
      setImportingRepoId(null);
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

  // Prefer enriched summary data with scan details if available, fallback to repo list
  const displayedRepos = (dashboardSummary?.repositories && dashboardSummary.repositories.length > 0)
    ? dashboardSummary.repositories
    : repositories;

  return (
    <div className="flex flex-col min-h-screen bg-[#030306] cyber-grid-bg text-foreground">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar currentPath="/repositories" />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-[1600px] mx-auto space-y-8">

          {/* GitHub Connection Banner (Top alert) */}
          {!isGithubConnected && !githubLoading && (
            <div className="p-5 border border-cyber-purple/35 bg-[#0a0715]/90 text-left relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5 cyber-card-clip">
              {/* Dot Matrix overlay */}
              <div className="absolute inset-0 cyber-grid-dot opacity-20 pointer-events-none" />

              <div className="flex gap-4 items-start relative z-10">
                <div className="border border-cyber-purple bg-cyber-purple/10 text-cyber-purple shrink-0 h-11 w-11 flex items-center justify-center shadow-[0_0_12px_#8f00ff35]">
                  <GitFork className="h-5.5 w-5.5 shrink-0" />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-xs font-orbitron font-extrabold text-white uppercase tracking-wider">
                    Connect GitHub
                  </h4>
                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed max-w-3xl">
                    Unlock full DevSecOps automation. Authenticate GitHub integrations to index projects instantly, automatically check code on incoming pull requests, and commit secure AI remedies.
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="shrink-0 border-cyber-purple/40 text-cyber-purple hover:text-white hover:border-cyber-purple shadow-[0_0_8px_#8f00ff20] relative z-10 font-mono py-2"
                onClick={handleConnectGithub}
              >
                CONNECT GITHUB
              </Button>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-cyber-cyan/15 pb-6">
            <div className="text-left">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-white uppercase tracking-wider leading-none">
                  Repositories
                </h1>
                {isGithubConnected && (
                  <span className="inline-flex items-center px-3 py-0.5 text-[9px] font-bold tracking-wider font-mono uppercase bg-[#051e12]/80 text-[#00ff66] border border-[#00ff66]/35 shadow-[0_0_8px_rgba(0,255,102,0.15)] select-none">
                    <span className="h-1 w-1 rounded-full mr-1.5 shrink-0 bg-cyber-green animate-pulse" />
                    GITHUB INTEGRATION ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mt-2">
                Configure scanning triggers and secure code integrations across active repositories.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {isGithubConnected && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDisconnectGithub}
                  className="border-zinc-800 text-zinc-400 hover:bg-cyber-pink/10 hover:border-cyber-pink/40 hover:text-cyber-pink flex items-center gap-1.5 py-2.5 font-mono"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  DISCONNECT
                </Button>
              )}
              <Button
                onClick={() => {
                  setIsAddModalOpen(true);
                  setActiveTab(isGithubConnected ? "github" : "url");
                }}
                variant="primary"
                className="shadow-[0_0_15px_rgba(0,240,255,0.45)] flex items-center justify-center gap-1.5 py-2.5"
              >
                <Plus className="h-4.5 w-4.5" />
                ADD CODEBASE
              </Button>
            </div>
          </div>

          {/* Repo Grid */}
          <section className="w-full">
            <RepositoryList
              repositories={displayedRepos}
              gridCols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              loading={(repoLoading || analysisLoading) && displayedRepos.length === 0}
              error={repoError}
            />
          </section>

          {/* Connect Repository Modal */}
          <Modal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            title={
              <div className="flex items-center gap-2 text-white">
                <GitBranch className="h-5 w-5 text-cyber-cyan" />
                <span className="font-orbitron font-extrabold uppercase tracking-wider text-xs">Add Repository</span>
              </div>
            }
            size="lg"
          >
            {/* Modal Tabs */}
            <div className="flex border-b border-zinc-700 mb-6 bg-[#0c0d16] select-none font-mono overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab("github")}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer shrink-0 ${activeTab === "github"
                  ? "border-cyber-cyan text-cyber-cyan text-shadow-cyan bg-cyber-cyan/5"
                  : "border-transparent text-zinc-300 hover:text-white hover:bg-zinc-800/60"
                  }`}
              >
                <GitFork className="h-4 w-4 shrink-0" />
                GITHUB INTEGRATION
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("url")}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer shrink-0 ${activeTab === "url"
                  ? "border-cyber-cyan text-cyber-cyan text-shadow-cyan bg-cyber-cyan/5"
                  : "border-transparent text-zinc-300 hover:text-white hover:bg-zinc-800/60"
                  }`}
              >
                <Link2 className="h-4 w-4 shrink-0" />
                REMOTE GIT URL
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer shrink-0 ${activeTab === "upload"
                  ? "border-cyber-cyan text-cyber-cyan text-shadow-cyan bg-cyber-cyan/5"
                  : "border-transparent text-zinc-300 hover:text-white hover:bg-zinc-800/60"
                  }`}
              >
                <Upload className="h-4 w-4 shrink-0" />
                UPLOAD ZIP ARCHIVE
              </button>
            </div>

            {/* TAB CONTENT: GitHub Import */}
            {activeTab === "github" && (
              <div className="flex flex-col gap-4 text-left">
                {!isGithubConnected ? (
                  // Connected State Fallback inside Modal
                  <div className="flex flex-col items-center justify-center text-center p-8 bg-zinc-950/40 border border-zinc-900 rounded-none gap-5 relative overflow-hidden">
                    <div className="absolute inset-0 cyber-grid-dot opacity-20 pointer-events-none" />

                    <div className="h-14 w-14 border border-cyber-purple bg-cyber-purple/10 text-cyber-purple flex items-center justify-center shadow-[0_0_15px_#8f00ff35] animate-pulse">
                      <GitFork className="h-7 w-7" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-orbitron font-extrabold text-white uppercase tracking-wider">
                        GitHub Not Connected
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-sans max-w-sm leading-relaxed">
                        Link your workspace directory to GitHub to index repository databases and search codebases directly.
                      </p>
                    </div>
                    <Button onClick={handleConnectGithub} className="w-full sm:w-auto py-2.5 font-mono">
                      CONNECT GITHUB
                    </Button>
                  </div>
                ) : (
                  // Connected GitHub Repository List
                  <div className="flex flex-col gap-5">
                    {/* Repository search and metadata */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between font-mono">
                      <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input
                          type="text"
                          value={githubSearchQuery}
                          onChange={(e) => setGithubSearchQuery(e.target.value)}
                          placeholder="Search repositories..."
                          className="w-full pl-9 pr-4 py-2.5 text-xs rounded-none border border-zinc-800 bg-[#07070b]/90 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/35 transition-colors font-mono"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest shrink-0">
                        {unimportedRepos.length} Repos Available
                      </span>
                    </div>

                    {/* Repository rows list */}
                    {githubLoading ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="h-7 w-7 border-2 border-cyber-cyan border-t-transparent animate-spin rounded-full" />
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest animate-pulse">Loading repositories...</span>
                      </div>
                    ) : unimportedRepos.length === 0 ? (
                      <div className="text-center py-12 text-xs font-mono text-zinc-500 border border-dashed border-zinc-800 bg-[#0b0b14]/20 uppercase tracking-wider">
                        {githubSearchQuery ? "// No repositories match query." : "// All active repos imported."}
                      </div>
                    ) : (
                      <div className="flex flex-col border border-zinc-800 bg-[#050508] overflow-hidden max-h-[300px] overflow-y-auto scrollbar-thin">
                        {unimportedRepos.map((repo, idx) => (
                          <div
                            key={repo.id}
                            className={`flex items-center justify-between gap-4 p-3.5 text-xs ${idx !== unimportedRepos.length - 1 ? "border-b border-zinc-800/80" : ""
                              } hover:bg-[#0c0c14] transition-colors`}
                          >
                            <div className="flex flex-col gap-0.5 min-w-0 font-sans">
                              <span className="font-bold text-white truncate">{repo.name}</span>
                              <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                                <span className="uppercase text-cyber-cyan font-bold">{repo.default_branch || "main"}</span>
                                <span>•</span>
                                <span>{repo.private ? "PRIVATE" : "PUBLIC"}</span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleImportGithubRepo(repo.id)}
                              loading={importingRepoId === repo.id}
                              disabled={importingRepoId !== null && importingRepoId !== repo.id}
                              variant="secondary"
                              className="h-8 shadow-sm font-mono border-zinc-800/80 hover:border-cyber-cyan"
                            >
                              IMPORT
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: Remote Git URL */}
            {activeTab === "url" && (
              <form onSubmit={handleUrlSubmit} className="flex flex-col gap-6 text-left">
                <p className="text-xs text-zinc-400 leading-relaxed font-sans font-medium">
                  Enter remote Git endpoint URLs directly (e.g. public or credentialed GitHub, GitLab, or Bitbucket clone URLs) to clone and audit them.
                </p>

                <div className="grid gap-4 sm:grid-cols-2 mt-2">
                  <Input
                    label="Repository Name"
                    placeholder="e.g. remote-auth-microservice"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="bg-[#0b0b14]/90 border-zinc-800 focus:border-cyber-cyan text-zinc-200"
                  />
                  <Input
                    label="REMOTE GIT REPO URL (.git URL)"
                    placeholder="https://github.com/owner/repo.git"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    required
                    className="bg-[#0b0b14]/90 border-zinc-800 focus:border-cyber-cyan text-zinc-200"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-orbitron font-bold text-zinc-400 tracking-wider uppercase">
                        Branch
                      </label>
                      {isDiscoveringBranches && (
                        <span className="text-[9px] font-mono text-cyber-cyan flex items-center gap-1">
                          <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                          Detecting branches...
                        </span>
                      )}
                      {!isDiscoveringBranches && discoveredBranches.length > 0 && (
                        <span className="text-[9px] font-mono text-cyber-green flex items-center gap-1">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          {discoveredBranches.length} branch{discoveredBranches.length > 1 ? "es" : ""} found
                        </span>
                      )}
                    </div>

                    {discoveredBranches.length > 0 ? (
                      <div className="relative">
                        <select
                          value={urlBranch}
                          onChange={(e) => setUrlBranch(e.target.value)}
                          className="w-full px-4 py-2.5 bg-[#0b0b14]/90 border border-zinc-800 focus:border-cyber-cyan text-zinc-200 font-mono text-xs rounded-sm focus:outline-none transition-colors appearance-none cursor-pointer"
                        >
                          {discoveredBranches.map((branch) => (
                            <option key={branch} value={branch} className="bg-[#0b0b14] text-white">
                              {branch} {branch === "main" || branch === "master" ? "(Default Branch)" : ""}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 text-xs font-mono">
                          ▼
                        </div>
                      </div>
                    ) : (
                      <Input
                        placeholder="e.g. main (auto-detected when URL entered)"
                        value={urlBranch}
                        onChange={(e) => setUrlBranch(e.target.value)}
                        className="bg-[#0b0b14]/90 border-zinc-800 focus:border-cyber-cyan text-zinc-200"
                      />
                    )}

                    {branchDiscoveryError && (
                      <div className="p-3 bg-cyber-pink/10 border border-cyber-pink/30 text-[11px] text-zinc-300 space-y-1.5 mt-2 rounded-none">
                        <div className="flex items-center gap-1.5 text-cyber-pink font-bold font-mono">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                          <span>Repository Not Accessible</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 font-mono leading-relaxed">
                          {branchDiscoveryError}
                        </p>
                        {!isGithubConnected && repoUrl.includes("github.com") && (
                          <button
                            type="button"
                            onClick={handleConnectGithub}
                            className="text-[10px] text-cyber-cyan hover:underline font-mono font-bold flex items-center gap-1 pt-1 cursor-pointer"
                          >
                            <GitFork className="h-3 w-3" />
                            Connect GitHub to access your private repositories →
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <Input
                    label="PRIMARY PROGRAMMING LANGUAGE"
                    placeholder="e.g. Java, TypeScript, Python"
                    value={urlLanguage}
                    onChange={(e) => setUrlLanguage(e.target.value)}
                    className="bg-[#0b0b14]/90 border-zinc-800 focus:border-cyber-cyan text-zinc-200"
                  />
                </div>

                <div className="p-4 bg-[#0b0a14] border border-cyber-purple/20 flex items-start gap-3">
                  <Sparkles className="h-4.5 w-4.5 text-cyber-purple shrink-0 mt-0.5 animate-pulse" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-orbitron font-bold text-white uppercase tracking-wider">Private Repositories</span>
                    <p className="text-[10px] text-zinc-500 font-mono leading-relaxed">
                      Public repositories require no credentials. For your own private repositories, connect your GitHub integration or import directly from the GitHub tab.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsAddModalOpen(false)}
                    className="border-zinc-800 font-mono"
                  >
                    CANCEL
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    variant="primary"
                    loading={isSubmitting}
                    disabled={isSubmitting || !!branchDiscoveryError || isDiscoveringBranches || !repoUrl.trim()}
                    className="font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ADD REPOSITORY
                  </Button>
                </div>
              </form>
            )}

            {/* TAB CONTENT: ZIP File Upload */}
            {activeTab === "upload" && (
              <form onSubmit={handleUploadSubmit} className="flex flex-col gap-6 text-left">
                <p className="text-xs text-zinc-400 leading-relaxed font-sans font-medium">
                  Upload a repository package directly from your local PC. Select a codebase ZIP archive to upload, extract, and start auditing.
                </p>

                <div className="grid gap-4 sm:grid-cols-2 mt-2">
                  <Input
                    label="Repository Name"
                    placeholder="e.g. uploaded-auth-service"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    className="bg-[#0b0b14]/90 border-zinc-800 focus:border-cyber-cyan text-zinc-200"
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-orbitron font-bold text-zinc-400 tracking-wider uppercase">
                      Select ZIP File *
                    </label>
                    <input
                      type="file"
                      accept=".zip"
                      required
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setUploadFile(e.target.files[0]);
                          if (!uploadName) {
                            setUploadName(e.target.files[0].name.replace(".zip", ""));
                          }
                        }
                      }}
                      className="bg-[#0b0b14]/90 border border-zinc-800 focus:border-cyber-cyan text-zinc-200 text-xs p-2 file:mr-4 file:py-1 file:px-3 file:border file:border-cyber-purple/40 file:bg-cyber-purple/10 file:text-white file:text-xs file:font-mono hover:file:bg-cyber-purple/20 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Branch"
                    placeholder="e.g. main"
                    value={uploadBranch}
                    onChange={(e) => setUploadBranch(e.target.value)}
                    className="bg-[#0b0b14]/90 border-zinc-800 focus:border-cyber-cyan text-zinc-200"
                  />
                  <Input
                    label="PRIMARY PROGRAMMING LANGUAGE"
                    placeholder="e.g. Java, TypeScript, Python"
                    value={uploadLanguage}
                    onChange={(e) => setUploadLanguage(e.target.value)}
                    className="bg-[#0b0b14]/90 border-zinc-800 focus:border-cyber-cyan text-zinc-200"
                  />
                </div>

                <div className="p-4 bg-[#0b0a14] border border-cyber-purple/20 flex items-start gap-3">
                  <Sparkles className="h-4.5 w-4.5 text-cyber-purple shrink-0 mt-0.5 animate-pulse" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-orbitron font-bold text-white uppercase tracking-wider">Local Upload</span>
                    <p className="text-[10px] text-zinc-500 font-mono leading-relaxed">
                      Your uploaded repository package is extracted into an encrypted and sandboxed volume workspace on the server, requiring no credentials or external internet configuration.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsAddModalOpen(false)}
                    className="border-zinc-800 font-mono"
                  >
                    CANCEL
                  </Button>
                  <Button type="submit" size="sm" variant="primary" loading={isSubmitting} className="font-mono">
                    UPLOAD REPOSITORY
                  </Button>
                </div>
              </form>
            )}
          </Modal>

          <AppFooter />
        </main>
      </div>
    </div>
  );
}
