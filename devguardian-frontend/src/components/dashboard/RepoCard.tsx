import * as React from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { GitBranch, ShieldAlert, Clock, Trash2 } from "lucide-react";

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
  onDelete?: () => void;
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
  onDelete,
}) => {
  return (
    <Card
      onClick={onViewAnalysis}
      className="hover:border-cyber-cyan/50 cursor-pointer transition-all duration-300 p-6 flex flex-col justify-between h-full group"
      techCorners={true}
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <h4 className="text-sm font-bold truncate text-white flex items-center gap-2 group-hover:text-cyber-cyan transition-colors font-orbitron tracking-wider">
            <GitBranch className="h-4.5 w-4.5 text-cyber-cyan group-hover:animate-pulse" />
            {repoName}
          </h4>
          <Badge variant="neutral">{visibility}</Badge>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-muted-foreground mb-4">
          <span>{language}</span>
          {lastAnalyzed && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-cyber-cyan" />
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

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onViewAnalysis?.();
            }}
          >
            Report
          </Button>
          {onRunAnalysis && (
            <Button
              size="sm"
              variant="primary"
              className="px-4 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onRunAnalysis();
              }}
            >
              Scan
            </Button>
          )}
          {onDelete && (
            <button
              type="button"
              title="Delete repository"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="h-8 w-8 flex items-center justify-center border border-zinc-800 bg-black/40 text-zinc-400 hover:text-cyber-pink hover:border-cyber-pink/50 hover:bg-cyber-pink/10 transition-all cursor-pointer shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default RepoCard;

