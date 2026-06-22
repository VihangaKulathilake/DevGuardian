import api from "@/api/axios";
import { AnalysisResponse, IssueResponse } from "./analysisTypes";

export const analysisApi = {
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
