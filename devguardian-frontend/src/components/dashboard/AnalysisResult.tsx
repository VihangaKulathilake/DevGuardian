import * as React from "react";

export const AnalysisResult: React.FC = () => {
  return (
    <div className="p-4 border border-border bg-card rounded-xl">
      <h4 className="font-semibold mb-1 text-sm text-foreground">Analysis Result</h4>
      <p className="text-xs text-muted-foreground">Select a repository to view analysis results.</p>
    </div>
  );
};

export default AnalysisResult;
