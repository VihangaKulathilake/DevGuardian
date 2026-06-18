export interface AnalysisResponse {
  id: number;
  repositoryId: number;
  status: string;
  securityScore: number;
  qualityScore: number;
  architectureScore: number;
  totalIssues: number;
  startedAt: string;
  completedAt?: string;
}

export interface IssueResponse {
  id: number;
  ruleCode: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  filePath: string;
  lineNumber: number;
  recommendation: string;
}

export interface AnalysisState {
  analyses: AnalysisResponse[];
  issues: IssueResponse[];
  currentAnalysis: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
}
