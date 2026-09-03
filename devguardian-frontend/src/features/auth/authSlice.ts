import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authApi, AsgardeoAuthPayload } from "./authApi";
import { AuthState, LoginCredentials, RegisterData } from "./authTypes";

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      return await authApi.login(credentials);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      return await authApi.register(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Registration failed");
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  "auth/googleLogin",
  async (idToken: string, { rejectWithValue }) => {
    try {
      return await authApi.loginWithGoogle(idToken);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Google authentication failed");
    }
  }
);

export const loginWithAsgardeo = createAsyncThunk(
  "auth/asgardeoLogin",
  async (payload: AsgardeoAuthPayload, { rejectWithValue }) => {
    try {
      return await authApi.loginWithAsgardeo(payload);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Asgardeo authentication failed");
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      authApi.logout();
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    initializeAuth: (state) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");
        if (token && userStr) {
          try {
            // Check if token is expired
            const arrayToken = token.split('.');
            if (arrayToken.length === 3) {
              const tokenPayload = JSON.parse(atob(arrayToken[1]));
              if (tokenPayload.exp && tokenPayload.exp * 1000 < Date.now()) {
                authApi.logout();
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                return;
              }
            } else {
              authApi.logout();
              state.user = null;
              state.token = null;
              state.isAuthenticated = false;
              return;
            }
            state.token = token;
            state.user = JSON.parse(userStr);
            state.isAuthenticated = true;
          } catch {
            authApi.logout();
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
          }
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = {
          userId: action.payload.userId,
          email: action.payload.email,
          name: action.payload.name,
          role: action.payload.role,
        };
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // registerUser
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = {
          userId: action.payload.userId,
          email: action.payload.email,
          name: action.payload.name,
          role: action.payload.role,
        };
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // loginWithGoogle
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = {
          userId: action.payload.userId,
          email: action.payload.email,
          name: action.payload.name,
          role: action.payload.role,
        };
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // loginWithAsgardeo
      .addCase(loginWithAsgardeo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithAsgardeo.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = {
          userId: action.payload.userId,
          email: action.payload.email,
          name: action.payload.name,
          role: action.payload.role,
        };
      })
      .addCase(loginWithAsgardeo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
