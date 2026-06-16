import api from "./api";

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

export const analysisService = {
  async startAnalysis(repositoryId: number): Promise<AnalysisResponse> {
    const response = await api.post<AnalysisResponse>(`/api/analyses/${repositoryId}/start`);
    return response.data;
  },

  async getAnalysis(analysisId: number): Promise<AnalysisResponse> {
    const response = await api.get<AnalysisResponse>(`/api/analyses/${analysisId}`);
    return response.data;
  },

  async getRepositoryAnalyses(repositoryId: number): Promise<AnalysisResponse[]> {
    const response = await api.get<AnalysisResponse[]>(`/api/analyses/repository/${repositoryId}`);
    return response.data;
  },

  async getAnalysisIssues(analysisId: number): Promise<IssueResponse[]> {
    const response = await api.get<IssueResponse[]>(`/api/analyses/${analysisId}/issues`);
    return response.data;
  },
};
