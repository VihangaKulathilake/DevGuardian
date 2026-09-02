import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RepoCard from "./RepoCard";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchRepositories, removeRepository } from "@/features/repository/repositorySlice";
import { triggerAnalysis } from "@/features/analysis/analysisSlice";
import { analysisApi } from "@/features/analysis/analysisApi";
import { AlertTriangle, Trash2 } from "lucide-react";

export const RepositoryList: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { repositories, loading, error } = useAppSelector((state) => state.repo);

  const [deletingRepo, setDeletingRepo] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [repoDetails, setRepoDetails] = useState<Record<number, {
    lastAnalyzed: string;
    critical: number;
    warning: number;
    info: number;
    status: string;
  }>>({});

  useEffect(() => {
    dispatch(fetchRepositories());
  }, [dispatch]);

  useEffect(() => {
    if (repositories.length === 0) return;

    const fetchRepoDetails = async () => {
      const details: typeof repoDetails = {};
      
      await Promise.all(repositories.map(async (repo) => {
        try {
          const analyses = await analysisApi.getRepositoryAnalyses(repo.id);
          if (analyses.length > 0) {
            const latest = analyses[0];
            if (latest.status === "COMPLETED") {
              const issues = await analysisApi.getAnalysisIssues(latest.id);
              const critical = issues.filter(i => i.severity.toUpperCase() === "CRITICAL").length;
              const warning = issues.filter(i => i.severity.toUpperCase() === "HIGH" || i.severity.toUpperCase() === "MEDIUM").length;
              const info = issues.filter(i => i.severity.toUpperCase() === "LOW" || i.severity.toUpperCase() === "INFO").length;
              
              details[repo.id] = {
                lastAnalyzed: new Date(latest.startedAt).toLocaleDateString(),
                critical,
                warning,
                info,
                status: latest.status
              };
            } else {
              details[repo.id] = {
                lastAnalyzed: latest.status === "RUNNING" ? "Scanning..." : "Failed scan",
                critical: 0,
                warning: 0,
                info: 0,
                status: latest.status
              };
            }
          } else {
            details[repo.id] = {
              lastAnalyzed: "Never scanned",
              critical: 0,
              warning: 0,
              info: 0,
              status: "NONE"
            };
          }
        } catch (e) {
          console.error(`Failed to fetch details for repo ${repo.id}:`, e);
          details[repo.id] = {
            lastAnalyzed: "Error",
            critical: 0,
            warning: 0,
            info: 0,
            status: "ERROR"
          };
        }
      }));

      setRepoDetails(details);
    };

    fetchRepoDetails();
  }, [repositories]);

  const handleRunAnalysis = async (repoId: number) => {
    try {
      const resultAction = await dispatch(triggerAnalysis(repoId));
      if (triggerAnalysis.fulfilled.match(resultAction)) {
        const analysis = resultAction.payload;
        router.push(`/analysis?repoId=${repoId}&analysisId=${analysis.id}`);
      }
    } catch (err) {
      console.error("Failed to trigger analysis:", err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRepo) return;
    setIsDeleting(true);
    try {
      await dispatch(removeRepository(deletingRepo.id));
      setDeletingRepo(null);
    } catch (err) {
      console.error("Failed to delete repository:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 border border-border/50 bg-[#0d0d12]/40 animate-pulse p-6 flex flex-col justify-between cyber-card-clip">
            <div className="space-y-3">
              <div className="h-4 w-28 bg-zinc-800 rounded" />
              <div className="h-3 w-16 bg-zinc-800 rounded" />
            </div>
            <div className="h-8 w-full bg-zinc-800 rounded mt-6" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 font-mono text-xs uppercase tracking-wider text-cyber-pink border border-cyber-pink/20 bg-cyber-pink/5">
        Error loading repositories: {error}
      </div>
    );
  }

  if (!repositories || repositories.length === 0) {
    return (
      <div className="text-center py-16 font-mono text-xs uppercase tracking-wider text-muted-foreground border border-dashed border-border/80 bg-card/10 cyber-card-clip">
        No repositories added yet
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {repositories.map((repo) => {
          const details = repoDetails[repo.id] || {
            lastAnalyzed: "Loading...",
            critical: 0,
            warning: 0,
            info: 0,
            status: "LOADING"
          };
          return (
            <RepoCard
              key={repo.id}
              repoName={repo.name}
              visibility={repo.visibility.toLowerCase() as "public" | "private"}
              language={repo.language || "Unknown"}
              lastAnalyzed={details.lastAnalyzed}
              criticalIssues={details.critical}
              warningIssues={details.warning}
              infoIssues={details.info}
              onRunAnalysis={() => handleRunAnalysis(repo.id)}
              onViewAnalysis={() => router.push(`/analysis?repoId=${repo.id}`)}
              onDelete={() => setDeletingRepo({ id: repo.id, name: repo.name })}
            />
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingRepo}
        onClose={() => !isDeleting && setDeletingRepo(null)}
        title={
          <div className="flex items-center gap-2 text-cyber-pink">
            <AlertTriangle className="h-5 w-5" />
              <span className="font-orbitron font-extrabold uppercase tracking-wider text-xs">
                Delete Repository
              </span>
          </div>
        }
        size="sm"
      >
        <div className="space-y-5 text-left font-sans">
          <p className="text-xs text-zinc-300 leading-relaxed">
            Are you sure you want to delete and unlink{" "}
            <strong className="text-white font-mono uppercase underline decoration-cyber-pink/50">
              {deletingRepo?.name}
            </strong>
            ?
          </p>
          <div className="p-3.5 bg-cyber-pink/10 border border-cyber-pink/30 text-[11px] text-zinc-400 space-y-1">
            <span className="font-bold text-cyber-pink uppercase font-mono tracking-wider block">
              Warning — This cannot be undone
            </span>
            <p>
              This will remove all associated vulnerability audits, security scan logs, and disk workspace caches.
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={isDeleting}
              onClick={() => setDeletingRepo(null)}
              className="border-zinc-800 text-zinc-400 hover:text-white font-mono text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="bg-cyber-pink hover:bg-cyber-pink/80 text-white font-mono text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {isDeleting ? "Deleting..." : "Delete Repository"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default RepositoryList;

