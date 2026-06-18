import api from "@/api/axios";
import { RepositoryResponse } from "./repositoryTypes";

export const repositoryApi = {
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
