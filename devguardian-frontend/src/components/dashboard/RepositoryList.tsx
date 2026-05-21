import * as React from "react";
import RepoCard from "./RepoCard";

export const RepositoryList: React.FC = () => {
  const dummyRepos = [
    {
      repoName: "auth-service",
      visibility: "private" as const,
      language: "TypeScript",
      lastAnalyzed: "2 hours ago",
      criticalIssues: 0,
      warningIssues: 2,
      infoIssues: 5,
    },
    {
      repoName: "payment-gateway",
      visibility: "private" as const,
      language: "Go",
      lastAnalyzed: "1 day ago",
      criticalIssues: 3,
      warningIssues: 8,
      infoIssues: 12,
    },
    {
      repoName: "devguardian-frontend",
      visibility: "public" as const,
      language: "TypeScript",
      lastAnalyzed: "Just now",
      criticalIssues: 1,
      warningIssues: 4,
      infoIssues: 7,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {dummyRepos.map((repo, i) => (
        <RepoCard key={i} {...repo} />
      ))}
    </div>
  );
};

export default RepositoryList;
