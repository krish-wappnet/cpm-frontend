import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../rootReducer";
import api, { setToken } from "../../services/api";
import type { AxiosError } from 'axios';

interface ApiErrorResponse {
  message: string;
}

interface AuthState {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    department?: string;
  } | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Update User type to match API response
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  department?: string;
}

const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch  {
    return true;
  }
};

const token = localStorage.getItem("token");
const userFromStorage = localStorage.getItem("user");

if (token) {
  try {
    setToken(token);
  } catch (error) {
    console.error("Error setting auth token:", error);
  }
}

const initialState: AuthState = {
  user: userFromStorage ? JSON.parse(userFromStorage) : null,
  token: token,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", credentials);
      const { access_token, user } = response.data;
      
      // Transform the user data to match our expected format
      const transformedUser = {
        ...user,
        role: user.roles?.[0]?.toUpperCase() || 'EMPLOYEE', // Take first role and convert to uppercase
      };
      
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(transformedUser));
      setToken(access_token);
      
      return { token: access_token, user: transformedUser };
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        apiError.response?.data?.message || "Failed to login"
      );
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (
    {
      firstName,
      lastName,
      email,
      password,
      position,
      department,
    }: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      position?: string;
      department?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/auth/register", {
        firstName,
        lastName,
        email,
        password,
        ...(position && { position }),
        ...(department && { department }),
      });

      if (!response.data.access_token || !response.data.user) {
        throw new Error("Invalid response from server");
      }

      const { access_token, user } = response.data;

      setToken(access_token);
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      return {
        user,
        access_token,
      };
    } catch (error: unknown) {
      console.error("Registration error:", error);
      if (error && typeof error === "object" && "response" in error && error.response && typeof error.response === "object" && "data" in error.response && error.response.data && typeof error.response.data === "object" && "message" in error.response.data) {
        return rejectWithValue(error.response.data.message || "Registration failed. Please try again.");
      }
      return rejectWithValue("Registration failed. Please try again.");
    }
  }
);

export const loadUser = createAsyncThunk<User, void, { state: RootState }>(
  "auth/loadUser",
  async (_, { getState, rejectWithValue, dispatch }) => {
    const token = getState().auth?.token;

    if (!token || isTokenExpired(token)) {
      dispatch(logout());
      return rejectWithValue("Session expired. Please log in again.");
    }

    try {
      setToken(token);

      const userData = localStorage.getItem("user");
      if (!userData) {
        throw new Error("No user data found");
      }

      const user = JSON.parse(userData);
      return user as User;
    } catch (error: unknown) {
      console.error("Error loading user:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken("");
      return rejectWithValue("Failed to load user data. Please log in again.");
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      // Clear local storage and state without API call
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken("");
      return null;
    } catch (error) {
      return rejectWithValue("Failed to logout");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === "string" ? action.payload : "Failed to login";
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      });

    builder.addCase(loadUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loadUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.error = null;
      if (action.payload) {
        localStorage.setItem("user", JSON.stringify(action.payload));
      }
    });
    builder.addCase(loadUser.rejected, (state, action) => {
      state.loading = false;
      state.user = null;
      state.token = null;
      state.error = action.payload as string;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    });

    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.access_token;
      state.error = null;
      if (action.payload.access_token) {
        setToken(action.payload.access_token);
      }
    });
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.user = null;
      state.token = null;
      state.error = action.payload as string;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken("");
    });
  },
});

export const { clearError } = authSlice.actions;

export const selectAuthUser = (state: RootState) => state.auth?.user ?? null;
export const selectAuthToken = (state: RootState) => state.auth?.token ?? null;
export const selectAuthLoading = (state: RootState) => state.auth?.loading ?? false;
export const selectAuthError = (state: RootState) => state.auth?.error ?? null;

export default authSlice.reducer;
