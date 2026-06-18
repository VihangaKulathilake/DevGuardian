import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import repoReducer from "@/features/repository/repositorySlice";
import analysisReducer from "@/features/analysis/analysisSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    repo: repoReducer,
    analysis: analysisReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
