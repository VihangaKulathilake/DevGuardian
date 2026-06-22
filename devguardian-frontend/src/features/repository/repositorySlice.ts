import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { repositoryApi } from "./repositoryApi";
import { RepoState } from "./repositoryTypes";

const initialState: RepoState = {
  repositories: [],
  currentRepository: null,
  loading: false,
  error: null,
  githubRepositories: [],
  isGithubConnected: false,
  githubLoading: false,
  githubError: null,
};

export const fetchRepositories = createAsyncThunk(
  "repo/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await repositoryApi.getRepositories();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch repositories");
    }
  }
);

export const fetchRepositoryById = createAsyncThunk(
  "repo/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await repositoryApi.getRepository(id);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch repository details");
    }
  }
);

export const addRepository = createAsyncThunk(
  "repo/add",
  async (repoData: any, { rejectWithValue }) => {
    try {
      return await repositoryApi.createRepository(repoData);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to add repository");
    }
  }
);

export const removeRepository = createAsyncThunk(
  "repo/remove",
  async (id: number, { rejectWithValue }) => {
    try {
      await repositoryApi.deleteRepository(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete repository");
    }
  }
);

// GitHub Integration Actions
export const fetchGithubRepositories = createAsyncThunk(
  "repo/fetchGithub",
  async (_, { rejectWithValue }) => {
    try {
      return await repositoryApi.getGithubRepositories();
    } catch (err: any) {
      return rejectWithValue({
        message: err.response?.data?.message || "Failed to fetch GitHub repos",
        status: err.response?.status,
      });
    }
  }
);

export const connectGithubAccount = createAsyncThunk(
  "repo/connectGithub",
  async (_, { rejectWithValue }) => {
    try {
      const authUrl = await repositoryApi.connectGithub();
      if (authUrl) {
        window.location.href = authUrl;
      }
      return authUrl;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to initiate GitHub connection");
    }
  }
);

export const importGithubRepository = createAsyncThunk(
  "repo/importGithub",
  async (githubRepoId: number, { rejectWithValue }) => {
    try {
      return await repositoryApi.importRepository(githubRepoId);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to import repository");
    }
  }
);

export const disconnectGithubAccount = createAsyncThunk(
  "repo/disconnectGithub",
  async (_, { rejectWithValue }) => {
    try {
      await repositoryApi.disconnectGithub();
      return true;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to disconnect GitHub");
    }
  }
);

export const repositorySlice = createSlice({
  name: "repo",
  initialState,
  reducers: {
    clearCurrentRepository: (state) => {
      state.currentRepository = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRepositories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRepositories.fulfilled, (state, action) => {
        state.loading = false;
        state.repositories = action.payload;
      })
      .addCase(fetchRepositories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchRepositoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRepositoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRepository = action.payload;
      })
      .addCase(fetchRepositoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addRepository.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addRepository.fulfilled, (state, action) => {
        state.loading = false;
        state.repositories.push(action.payload);
      })
      .addCase(addRepository.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(removeRepository.fulfilled, (state, action) => {
        state.repositories = state.repositories.filter((r) => r.id !== action.payload);
        if (state.currentRepository?.id === action.payload) {
          state.currentRepository = null;
        }
      })
      // fetchGithubRepositories
      .addCase(fetchGithubRepositories.pending, (state) => {
        state.githubLoading = true;
        state.githubError = null;
      })
      .addCase(fetchGithubRepositories.fulfilled, (state, action) => {
        state.githubLoading = false;
        state.githubRepositories = action.payload;
        state.isGithubConnected = true;
      })
      .addCase(fetchGithubRepositories.rejected, (state, action: any) => {
        state.githubLoading = false;
        state.githubError = action.payload?.message || "Failed to load GitHub repos";
        if (action.payload?.status === 404) {
          state.isGithubConnected = false;
          state.githubRepositories = [];
        }
      })
      // importGithubRepository
      .addCase(importGithubRepository.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(importGithubRepository.fulfilled, (state, action) => {
        state.loading = false;
        state.repositories.push(action.payload);
      })
      .addCase(importGithubRepository.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // disconnectGithubAccount
      .addCase(disconnectGithubAccount.fulfilled, (state) => {
        state.isGithubConnected = false;
        state.githubRepositories = [];
      });
  },
});

export const { clearCurrentRepository } = repositorySlice.actions;
export default repositorySlice.reducer;
