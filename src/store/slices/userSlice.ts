import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../rootReducer';
import api from '../../services/api';
import type { AxiosError } from 'axios';

interface ApiErrorResponse {
  message: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  position: string;
  department: string | null;
  managerId: string | null;
  manager?: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  departmentId?: string;
  password: string;
  position?: string;
  department?: string;
}

type UpdateUserDto = Partial<Omit<CreateUserDto, 'password'>>;

interface UsersResponse {
  items: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface UserState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  total: number;
  filters: {
    page: number;
    limit: number;
    search?: string;
  };
}

export const initialState: UserState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  total: 0,
  filters: {
    page: 1,
    limit: 10,
  },
};

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: { page?: number; limit?: number; search?: string }, { rejectWithValue }) => {
    try {
      const response = await api.get('/users', { params });
      return response.data as UsersResponse;
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        apiError.response?.data?.message || 'Failed to fetch users'
      );
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data as User;
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        apiError.response?.data?.message || 'Failed to fetch user'
      );
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: CreateUserDto, { rejectWithValue }) => {
    try {
      const response = await api.post('/users', userData);
      return response.data as User;
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        apiError.response?.data?.message || 'Failed to create user'
      );
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async (
    { id, userData }: { id: string; userData: UpdateUserDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data as User;
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        apiError.response?.data?.message || 'Failed to update user'
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${id}`);
      return id;
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        apiError.response?.data?.message || 'Failed to delete user'
      );
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.items;
        state.total = action.payload.total;
        if (!state.filters) {
          state.filters = {
            page: 1,
            limit: 10
          };
        }
        if (typeof action.payload.page === 'number') {
          state.filters.page = action.payload.page;
        }
        if (typeof action.payload.limit === 'number') {
          state.filters.limit = action.payload.limit;
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to fetch users';
      });

    builder.addCase(fetchUserById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchUserById.fulfilled,
      (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.currentUser = action.payload;
      }
    );
    builder.addCase(fetchUserById.rejected, (state, action) => {
      state.loading = false;
      if (action.payload) {
        state.error = typeof action.payload === 'string' 
          ? action.payload 
          : 'Failed to fetch user';
      } else {
        state.error = 'Failed to fetch user';
      }
    });

    builder.addCase(createUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      createUser.fulfilled,
      (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.users = [...state.users, action.payload];
        state.total = state.total + 1;
      }
    );
    builder.addCase(createUser.rejected, (state, action) => {
      state.loading = false;
      state.error = typeof action.payload === 'string' 
        ? action.payload 
        : 'Failed to create user';
    });

    builder.addCase(updateUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      updateUser.fulfilled,
      (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.users = state.users.map((user) =>
          user.id === action.payload.id ? action.payload : user
        );
      }
    );
    builder.addCase(updateUser.rejected, (state, action) => {
      state.loading = false;
      state.error = typeof action.payload === 'string'
        ? action.payload
        : 'Failed to update user';
    });

    builder.addCase(deleteUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      deleteUser.fulfilled,
      (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.users = state.users.filter((user) => user.id !== action.payload);
        state.total = state.total - 1;
      }
    );
    builder.addCase(deleteUser.rejected, (state, action) => {
      state.loading = false;
      state.error = typeof action.payload === 'string'
        ? action.payload
        : 'Failed to delete user';
    });
  },
});

export const { clearCurrentUser, clearError, resetState } = userSlice.actions;

export const selectUsers = (state: RootState) => state.users?.users ?? [];
export const selectUsersResponse = (state: RootState) => state.users.users;
export const selectCurrentUser = (state: RootState) => state.users.currentUser;
export const selectUsersLoading = (state: RootState) => state.users?.loading ?? false;
export const selectUsersError = (state: RootState) => state.users.error;
export const selectTotalUsers = (state: RootState) => state.users?.total ?? 0;

export default userSlice.reducer;
