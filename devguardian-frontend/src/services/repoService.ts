import api from "./api";

export interface RepositoryResponse {
  id: number;
  name: string;
  url: string;
  description?: string;
  language?: string;
  branch?: string;
  provider: string;
  visibility: string;
  status: string;
  type?: string;
  scanFrequency?: string;
  createdAt: string;
}

export const repoService = {
  async getRepositories(): Promise<RepositoryResponse[]> {
    const response = await api.get<RepositoryResponse[]>("/api/repositories");
    return response.data;
  },

  async getRepository(id: number): Promise<RepositoryResponse> {
    const response = await api.get<RepositoryResponse>(`/api/repositories/${id}`);
    return response.data;
  },

  async createRepository(repoData: any): Promise<RepositoryResponse> {
    const response = await api.post<RepositoryResponse>("/api/repositories", repoData);
    return response.data;
  },

  async updateRepository(id: number, repoData: any): Promise<RepositoryResponse> {
    const response = await api.put<RepositoryResponse>(`/api/repositories/${id}`, repoData);
    return response.data;
  },

  async deleteRepository(id: number): Promise<void> {
    await api.delete(`/api/repositories/${id}`);
  },
};
