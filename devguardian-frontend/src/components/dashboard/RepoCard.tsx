import * as React from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { GitBranch, ShieldAlert, Clock } from "lucide-react";

export interface RepoCardProps {
  repoName: string;
  visibility: "public" | "private";
  language: string;
  lastAnalyzed?: string;
  criticalIssues: number;
  warningIssues: number;
  infoIssues: number;
  onRunAnalysis?: () => void;
  onViewAnalysis?: () => void;
}

export const RepoCard: React.FC<RepoCardProps> = ({
  repoName,
  visibility,
  language,
  lastAnalyzed,
  criticalIssues,
  warningIssues,
  infoIssues,
  onRunAnalysis,
  onViewAnalysis,
}) => {
  return (
    <Card
      onClick={onViewAnalysis}
      className="hover:border-primary/45 cursor-pointer transition-all duration-200 p-6 flex flex-col justify-between h-full group"
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <h4 className="text-base font-bold truncate text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
            <GitBranch className="h-4 w-4 text-primary" />
            {repoName}
          </h4>
          <Badge variant="neutral">{visibility}</Badge>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <span>{language}</span>
          {lastAnalyzed && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {lastAnalyzed}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="mt-4">
        {/* Issue badges summary */}
        <div className="flex gap-2 flex-wrap mb-5">
          <Badge variant="error" className="flex items-center gap-1">
            <ShieldAlert className="h-3 w-3" />
            {criticalIssues} Critical
          </Badge>
          <Badge variant="warning" className="flex items-center gap-1">
            {warningIssues} Warning
          </Badge>
          <Badge variant="info" className="flex items-center gap-1">
            {infoIssues} Info
          </Badge>
        </div>

        <div className="flex gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onViewAnalysis?.();
            }}
          >
            View Report
          </Button>
          {onRunAnalysis && (
            <Button
              size="sm"
              className="px-4"
              onClick={(e) => {
                e.stopPropagation();
                onRunAnalysis();
              }}
            >
              Scan
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default RepoCard;
