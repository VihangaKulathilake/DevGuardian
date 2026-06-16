import * as React from "react";
import { useEffect } from "react";
import RepoCard from "./RepoCard";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchRepositories } from "@/store/repoSlice";
import { triggerAnalysis } from "@/store/analysisSlice";

export const RepositoryList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { repositories, loading, error } = useAppSelector((state) => state.repo);

  useEffect(() => {
    dispatch(fetchRepositories());
  }, [dispatch]);

  const handleRunAnalysis = async (repoId: number) => {
    try {
      const resultAction = await dispatch(triggerAnalysis(repoId));
      if (triggerAnalysis.fulfilled.match(resultAction)) {
        const analysis = resultAction.payload;
        window.location.href = `/analysis?repoId=${repoId}&analysisId=${analysis.id}`;
      }
    } catch (err) {
      console.error("Failed to trigger analysis:", err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground">
        Loading repositories...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-sm text-destructive">
        Error: {error}
      </div>
    );
  }

  if (!repositories || repositories.length === 0) {
    return (
      <div className="text-center py-16 text-sm text-muted-foreground border border-dashed border-border rounded-2xl bg-card/10">
        No repositories linked yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {repositories.map((repo) => (
        <RepoCard
          key={repo.id}
          repoName={repo.name}
          visibility={repo.visibility.toLowerCase() as "public" | "private"}
          language={repo.language || "Unknown"}
          lastAnalyzed={repo.status === "ACTIVE" ? "Pending scan" : "Never scanned"}
          criticalIssues={0}
          warningIssues={0}
          infoIssues={0}
          onRunAnalysis={() => handleRunAnalysis(repo.id)}
        />
      ))}
    </div>
  );
};

export default RepositoryList;
