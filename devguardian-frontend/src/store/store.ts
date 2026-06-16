import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import repoReducer from "./repoSlice";
import analysisReducer from "./analysisSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    repo: repoReducer,
    analysis: analysisReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
