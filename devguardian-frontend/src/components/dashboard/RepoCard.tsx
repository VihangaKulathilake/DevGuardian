import * as React from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { GitBranch, Clock, Trash2, ShieldAlert, AlertTriangle, Info } from "lucide-react";

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
  const total = criticalIssues + warningIssues + infoIssues;

  // Proportional widths for the mini stacked bar
  const critW = total > 0 ? (criticalIssues / total) * 100 : 0;
  const warnW = total > 0 ? (warningIssues / total) * 100 : 0;
  const infoW = total > 0 ? (infoIssues / total) * 100 : 0;

  return (
    <Card
      onClick={onViewAnalysis}
      className="hover:border-cyber-cyan/50 cursor-pointer transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between h-full group text-left relative overflow-hidden"
      techCorners={true}
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <h4 className="text-xs sm:text-sm font-bold truncate text-white flex items-center gap-1.5 group-hover:text-cyber-cyan transition-colors font-orbitron tracking-wider">
            <GitBranch className="h-4 w-4 text-cyber-cyan shrink-0 group-hover:animate-pulse" />
            <span className="truncate">{repoName}</span>
          </h4>
          <Badge variant="neutral" className="shrink-0 text-[10px] px-2 py-0.5 uppercase tracking-wider font-mono">
            {visibility}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono uppercase text-zinc-400 mb-4 flex-wrap">
          <span className="font-semibold text-zinc-300">{language}</span>
          {lastAnalyzed && (
            <>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1 text-zinc-300">
                <Clock className="h-3 w-3 text-cyber-cyan shrink-0" />
                <span>{lastAnalyzed}</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Issue count grid */}
      <div className="mt-auto">
        <div className="grid grid-cols-3 gap-2 mb-3">
          {/* Critical */}
          <div className="flex flex-col items-center justify-center py-2.5 px-1 bg-[#1a040a]/90 border border-[#ff0055]/30 rounded-none">
            <div className="flex items-center gap-1 text-[#ff0055] mb-0.5">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
            </div>
            <span
              className={`font-black font-mono leading-none tabular-nums text-lg sm:text-xl ${
                criticalIssues > 0 ? "text-[#ff0055]" : "text-zinc-500"
              }`}
            >
              {criticalIssues}
            </span>
            <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-rose-300/80 mt-1 text-center">
              Critical
            </span>
          </div>

          {/* Warning / Medium */}
          <div className="flex flex-col items-center justify-center py-2.5 px-1 bg-[#191200]/90 border border-[#ff9900]/30 rounded-none">
            <div className="flex items-center gap-1 text-[#ff9900] mb-0.5">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            </div>
            <span
              className={`font-black font-mono leading-none tabular-nums text-lg sm:text-xl ${
                warningIssues > 0 ? "text-[#ff9900]" : "text-zinc-500"
              }`}
            >
              {warningIssues}
            </span>
            <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-amber-300/80 mt-1 text-center">
              Warning
            </span>
          </div>

          {/* Info / Low */}
          <div className="flex flex-col items-center justify-center py-2.5 px-1 bg-[#030c18]/90 border border-[#00a8ff]/30 rounded-none">
            <div className="flex items-center gap-1 text-[#00a8ff] mb-0.5">
              <Info className="h-3.5 w-3.5 shrink-0" />
            </div>
            <span
              className={`font-black font-mono leading-none tabular-nums text-lg sm:text-xl ${
                infoIssues > 0 ? "text-[#00a8ff]" : "text-zinc-500"
              }`}
            >
              {infoIssues}
            </span>
            <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-cyan-300/80 mt-1 text-center">
              Info
            </span>
          </div>
        </div>

        {/* Proportional stacked bar */}
        {total > 0 && (
          <div className="h-[3px] w-full flex mb-3 overflow-hidden rounded-full bg-zinc-900">
            {critW > 0 && (
              <div
                className="h-full bg-[#ff0055] shadow-[0_0_4px_#ff0055]"
                style={{ width: `${critW}%` }}
              />
            )}
            {warnW > 0 && (
              <div
                className="h-full bg-[#ff9900] shadow-[0_0_4px_#ff9900]"
                style={{ width: `${warnW}%` }}
              />
            )}
            {infoW > 0 && (
              <div
                className="h-full bg-[#00a8ff]"
                style={{ width: `${infoW}%` }}
              />
            )}
          </div>
        )}

        {/* Total count line */}
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
            {total > 0 ? (
              <>
                <strong className="text-white font-bold">{total}</strong> Total issues
              </>
            ) : (
              <span className="text-[#00ff66] font-bold">No issues found ✓</span>
            )}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 font-mono text-[11px] py-2 truncate"
            onClick={(e) => {
              e.stopPropagation();
              onViewAnalysis?.();
            }}
          >
            VIEW REPORT
          </Button>
          {onRunAnalysis && (
            <Button
              size="sm"
              variant="primary"
              className="px-3 shrink-0 font-mono text-[11px] py-2"
              onClick={(e) => {
                e.stopPropagation();
                onRunAnalysis();
              }}
            >
              SCAN
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
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default RepoCard;
