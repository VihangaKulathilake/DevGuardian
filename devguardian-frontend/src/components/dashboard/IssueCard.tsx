import * as React from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { AlertTriangle, FileCode, ShieldX } from "lucide-react";

export interface IssueCardProps {
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  filePath: string;
  lineNo?: number;
  category: "security" | "quality";
  codeSnippet?: string;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  title,
  description,
  severity,
  filePath,
  lineNo,
  category,
  codeSnippet,
}) => {
  const getSeverityVariant = (sev: string): "error" | "warning" | "info" | "neutral" => {
    switch (sev) {
      case "critical":
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "neutral";
    }
  };

  return (
    <Card className="p-5 hover:border-destructive/30 transition-all duration-200">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={getSeverityVariant(severity)}>{severity}</Badge>
            <Badge variant="neutral">{category}</Badge>
          </div>
          <h4 className="text-sm font-semibold text-foreground mt-2">{title}</h4>
        </div>
        {category === "security" ? (
          <ShieldX className="h-5 w-5 text-destructive shrink-0" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
        )}
      </div>

      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{description}</p>

      <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground/80 mb-3 bg-black/20 p-2 rounded-lg border border-border">
        <FileCode className="h-3.5 w-3.5" />
        <span className="truncate">{filePath}</span>
        {lineNo && <span className="text-primary font-semibold">:L{lineNo}</span>}
      </div>

      {codeSnippet && (
        <pre className="text-xs font-mono bg-black/40 text-emerald-400 p-3 rounded-lg border border-border overflow-x-auto max-w-full">
          <code>{codeSnippet}</code>
        </pre>
      )}
    </Card>
  );
};

export default IssueCard;
