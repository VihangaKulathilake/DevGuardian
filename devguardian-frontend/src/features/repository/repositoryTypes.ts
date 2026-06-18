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

export interface RepoState {
  repositories: RepositoryResponse[];
  currentRepository: RepositoryResponse | null;
  loading: boolean;
  error: string | null;
}
