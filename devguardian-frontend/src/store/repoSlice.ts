import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { repoService, RepositoryResponse } from "@/services/repoService";

interface RepoState {
  repositories: RepositoryResponse[];
  currentRepository: RepositoryResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: RepoState = {
  repositories: [],
  currentRepository: null,
  loading: false,
  error: null,
};

export const fetchRepositories = createAsyncThunk(
  "repo/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await repoService.getRepositories();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch repositories");
    }
  }
);

export const fetchRepositoryById = createAsyncThunk(
  "repo/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await repoService.getRepository(id);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch repository details");
    }
  }
);

export const addRepository = createAsyncThunk(
  "repo/add",
  async (repoData: any, { rejectWithValue }) => {
    try {
      return await repoService.createRepository(repoData);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to add repository");
    }
  }
);

export const removeRepository = createAsyncThunk(
  "repo/remove",
  async (id: number, { rejectWithValue }) => {
    try {
      await repoService.deleteRepository(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete repository");
    }
  }
);

export const repoSlice = createSlice({
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
      });
  },
});

export const { clearCurrentRepository } = repoSlice.actions;
export default repoSlice.reducer;
