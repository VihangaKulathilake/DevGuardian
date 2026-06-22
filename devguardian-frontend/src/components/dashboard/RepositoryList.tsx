import * as React from "react";
import { useEffect, useState } from "react";
import RepoCard from "./RepoCard";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchRepositories } from "@/features/repository/repositorySlice";
import { triggerAnalysis } from "@/features/analysis/analysisSlice";
import { analysisApi } from "@/features/analysis/analysisApi";

export const RepositoryList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { repositories, loading, error } = useAppSelector((state) => state.repo);

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
            onViewAnalysis={() => window.location.href = `/analysis?repoId=${repo.id}`}
          />
        );
      })}
    </div>
  );
};

export default RepositoryList;
