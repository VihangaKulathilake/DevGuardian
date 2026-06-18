"use client";

import * as React from "react";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/navbar/Sidebar";
import RepositoryList from "@/components/dashboard/RepositoryList";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { Plus, GitBranch, Sparkles } from "lucide-react";
import { useAppDispatch } from "@/hooks/useRedux";
import { addRepository } from "@/features/repository/repositorySlice";

export default function RepositoriesPage() {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [repoUrl, setRepoUrl] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const dispatch = useAppDispatch();

  const handleAddRepoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const urlParts = repoUrl.trim().split("/");
      const extractedName = urlParts[urlParts.length - 1]?.replace(".git", "") || "repo";

      const resultAction = await dispatch(
        addRepository({
          name: extractedName,
          url: repoUrl,
          provider: "GITHUB",
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
      }
    } catch (err) {
      console.error("Failed to add repository:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar currentPath="/repositories" />
        <main className="flex-1 p-6 md:p-8 bg-background overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
                Linked Repositories
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage and configure security scans for your GitHub repositories.
              </p>
            </div>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="sm:w-auto shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Repository
            </Button>
          </div>

          {/* Repo Grid */}
          <section className="w-full">
            <RepositoryList />
          </section>

          {/* Add Repository Modal */}
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
            size="md"
          >
            <form onSubmit={handleAddRepoSubmit} className="flex flex-col gap-5">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect a public or private GitHub repository to start continuous security analysis, threat detection, and AI-powered pull request remediation.
              </p>
              
              <Input
                label="GitHub Repository URL"
                placeholder="https://github.com/owner/repository"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                required
              />

              <div className="p-3 bg-secondary rounded-xl border border-border flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-white">Auto-Scan Enabled</span>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    DevGuardian will automatically scan your code and branches on every git push or pull request event.
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
          </Modal>
        </main>
      </div>
    </div>
  );
}
