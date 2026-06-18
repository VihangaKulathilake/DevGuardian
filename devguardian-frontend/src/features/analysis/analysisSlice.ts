import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { analysisApi } from "./analysisApi";
import { AnalysisState } from "./analysisTypes";

const initialState: AnalysisState = {
  analyses: [],
  issues: [],
  currentAnalysis: null,
  loading: false,
  error: null,
};

export const triggerAnalysis = createAsyncThunk(
  "analysis/trigger",
  async (repoId: number, { rejectWithValue }) => {
    try {
      return await analysisApi.startAnalysis(repoId);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to trigger scan");
    }
  }
);

export const fetchRepositoryAnalyses = createAsyncThunk(
  "analysis/fetchByRepo",
  async (repoId: number, { rejectWithValue }) => {
    try {
      return await analysisApi.getRepositoryAnalyses(repoId);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch scans history");
    }
  }
);

export const fetchAnalysisIssues = createAsyncThunk(
  "analysis/fetchIssues",
  async (analysisId: number, { rejectWithValue }) => {
    try {
      return await analysisApi.getAnalysisIssues(analysisId);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch scan issues");
    }
  }
);

export const analysisSlice = createSlice({
  name: "analysis",
  initialState,
  reducers: {
    clearAnalysisState: (state) => {
      state.analyses = [];
      state.issues = [];
      state.currentAnalysis = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(triggerAnalysis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(triggerAnalysis.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAnalysis = action.payload;
        state.analyses.unshift(action.payload);
      })
      .addCase(triggerAnalysis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchRepositoryAnalyses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRepositoryAnalyses.fulfilled, (state, action) => {
        state.loading = false;
        state.analyses = action.payload;
        if (action.payload.length > 0) {
          state.currentAnalysis = action.payload[0];
        }
      })
      .addCase(fetchRepositoryAnalyses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAnalysisIssues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalysisIssues.fulfilled, (state, action) => {
        state.loading = false;
        state.issues = action.payload;
      })
      .addCase(fetchAnalysisIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAnalysisState } = analysisSlice.actions;
export default analysisSlice.reducer;
