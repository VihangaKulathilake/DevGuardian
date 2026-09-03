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
  repositoryId?: number;
  repositoryName?: string;
  ruleCode: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  filePath: string;
  lineNumber: number;
  recommendation: string;
  codeSnippet?: string;
}

export interface DashboardRepoSummary {
  id: number;
  name: string;
  url: string;
  visibility: string;
  language?: string;
  branch?: string;
  provider?: string;
  latestAnalysisId?: number;
  status?: string;
  securityScore?: number;
  qualityScore?: number;
  lastAnalyzed?: string;
  criticalIssues: number;
  warningIssues: number;
  infoIssues: number;
  totalIssues: number;
}

export interface DashboardActivityResponse {
  action: string;
  repoName: string;
  details: string;
  timestamp: string;
  status: string;
  securityScore?: number;
  totalIssues?: number;
}

export interface VulnerabilityTrendPoint {
  date: string;
  count: number;
}

export interface DashboardSummaryResponse {
  totalRepositories: number;
  totalScans: number;
  avgSecurityScore: number;
  scoreGrade: string;
  totalVulnerabilities: number;
  totalCodeSmells: number;
  totalCriticalAlerts: number;
  hasData: boolean;
  repositories: DashboardRepoSummary[];
  recentAlerts: IssueResponse[];
  recentActivities: DashboardActivityResponse[];
  vulnerabilitiesOverTime: VulnerabilityTrendPoint[];
}

export interface AnalysisState {
  analyses: AnalysisResponse[];
  issues: IssueResponse[];
  currentAnalysis: AnalysisResponse | null;
  dashboardSummary: DashboardSummaryResponse | null;
  loading: boolean;
  error: string | null;
}
