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

  // GitHub connection API calls
  async getGithubRepositories(): Promise<any[]> {
    const response = await api.get<any[]>("/api/github/repositories");
    return response.data;
  },

  async connectGithub(): Promise<string> {
    const response = await api.get<string>("/api/github/connect");
    return response.data;
  },

  async importRepository(githubRepoId: number): Promise<RepositoryResponse> {
    const response = await api.post<RepositoryResponse>("/api/repositories/import", { githubRepoId });
    return response.data;
  },

  async uploadRepository(formData: FormData): Promise<RepositoryResponse> {
    const response = await api.post<RepositoryResponse>("/api/repositories/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async disconnectGithub(): Promise<void> {
    await api.delete("/api/github/disconnect");
  },

  async getRemoteBranches(url: string): Promise<{ defaultBranch: string; branches: string[] }> {
    const response = await api.get<{ defaultBranch: string; branches: string[] }>("/api/repositories/remote-branches", {
      params: { url },
    });
    return response.data;
  },
};

export default repositoryApi;
