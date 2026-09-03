import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import RepoCard from "./RepoCard";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { removeRepository } from "@/features/repository/repositorySlice";
import { triggerAnalysis } from "@/features/analysis/analysisSlice";
import { AlertTriangle, Trash2 } from "lucide-react";
import { RepositoryResponse } from "@/features/repository/repositoryTypes";
import { DashboardRepoSummary } from "@/features/analysis/analysisTypes";

export interface RepoAnalysisDetail {
  lastAnalyzed: string;
  critical: number;
  warning: number;
  info: number;
  status: string;
}

export interface RepositoryListProps {
  repositories?: (RepositoryResponse | DashboardRepoSummary)[];
  repoDetails?: Record<number, RepoAnalysisDetail>;
  loading?: boolean;
  error?: string | null;
}

export const RepositoryList: React.FC<RepositoryListProps> = ({
  repositories: passedRepositories,
  repoDetails = {},
  loading: passedLoading,
  error: passedError,
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const reduxRepoState = useAppSelector((state) => state.repo);

  const repositories = passedRepositories ?? reduxRepoState.repositories;
  const loading = passedLoading ?? reduxRepoState.loading;
  const error = passedError ?? reduxRepoState.error;

  const [deletingRepo, setDeletingRepo] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  if (loading && (!repositories || repositories.length === 0)) {
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
          const directSummary = repo as DashboardRepoSummary;
          const details = repoDetails[repo.id] || {
            lastAnalyzed: directSummary.lastAnalyzed
              ? new Date(directSummary.lastAnalyzed).toLocaleDateString()
              : loading
              ? "Loading..."
              : "Never scanned",
            critical: directSummary.criticalIssues ?? 0,
            warning: directSummary.warningIssues ?? 0,
            info: directSummary.infoIssues ?? 0,
            status: directSummary.status ?? (loading ? "LOADING" : "NONE"),
          };

          return (
            <RepoCard
              key={repo.id}
              repoName={repo.name}
              visibility={((repo.visibility || "PUBLIC") as string).toLowerCase() as "public" | "private"}
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
