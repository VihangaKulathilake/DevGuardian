import api from "@/api/axios";
import { ModelStatus, AiIssueRequest, AiIssueResponse } from "./aiTypes";

export const aiApi = {
  async getAvailableModels(): Promise<ModelStatus[]> {
    const response = await api.get<ModelStatus[]>("/api/ai/models");
    return response.data;
  },

  async setActiveModel(provider: string): Promise<{ success: boolean; activeProvider: string; message: string }> {
    const response = await api.post(`/api/ai/models/active?provider=${encodeURIComponent(provider)}`);
    return response.data;
  },

  async enrichIssue(request: AiIssueRequest): Promise<AiIssueResponse> {
    const response = await api.post<AiIssueResponse>("/api/ai/enrich", request);
    return response.data;
  },
};

export default aiApi;
