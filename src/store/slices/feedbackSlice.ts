import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import type { RootState } from '../store';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import api from '../../services/api';

// Create axios instance with base URL
const apiInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

interface FeedbackReceivedParams {
  page?: number;
  limit?: number;
  userId: string;
}

interface FeedbackResponse {
  data: FeedbackState['received'];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export const fetchFeedbackReceived = createAsyncThunk<
  FeedbackResponse,
  FeedbackReceivedParams,
  { rejectValue: string }
>(
  'feedback/fetchReceived',
  async ({ page = 1, limit = 10, userId }, { rejectWithValue }) => {
    try {
      const response = await apiInstance.get<FeedbackResponse>('/feedback/received', {
        params: {
          page,
          limit,
          userId,
        },
      });
      return response.data;
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        apiError.response?.data?.message || 'Failed to fetch feedback'
      );
    }
  }
);

interface ApiErrorResponse {
  message: string;
}

interface Feedback {
  id: string;
  userId: string;
  content: string;
  type: 'suggestion' | 'bug' | 'feature';
  status: 'pending' | 'in-progress' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

interface CreateFeedbackDto {
  content: string;
  type: Feedback['type'];
}

interface FeedbackState {
  received: Array<{
    id: string;
    fromUser: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    requestId: string;
  }>;
  loading: boolean;
  error: string | null;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  feedbacks: Feedback[];
  currentFeedback: Feedback | null;
}

const initialState: FeedbackState = {
  received: [],
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  feedbacks: [],
  currentFeedback: null,
};

export const createFeedback = createAsyncThunk(
  'feedback/createFeedback',
  async (data: CreateFeedbackDto, { rejectWithValue }) => {
    try {
      const response = await api.post('/feedback', data);
      return response.data as Feedback;
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        apiError.response?.data?.message || 'Failed to create feedback'
      );
    }
  }
);

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    clearFeedbackError: (state) => {
      state.error = null;
    },
    resetFeedbackState: () => initialState,
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeedbackReceived.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedbackReceived.fulfilled, (state, action) => {
        state.loading = false;
        state.received = action.payload?.data || [];
        state.pagination = {
          ...state.pagination,
          total: action.payload?.pagination?.total || 0,
        };
      })
      .addCase(fetchFeedbackReceived.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch feedback';
      })
      .addCase(createFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFeedback.fulfilled, (state, action: PayloadAction<Feedback>) => {
        state.loading = false;
        state.feedbacks.push(action.payload);
      })
      .addCase(createFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to create feedback';
      });
  },
});

export const { clearFeedbackError, resetFeedbackState, clearError } = feedbackSlice.actions;

export const selectFeedbackReceived = (state: RootState) => state.feedback.received;
export const selectFeedbackLoading = (state: RootState) => state.feedback.loading;
export const selectFeedbackError = (state: RootState) => state.feedback.error;
export const selectFeedbackPagination = (state: RootState) => state.feedback.pagination;
export const selectFeedbacks = (state: RootState) => state.feedback.feedbacks;
export const selectCurrentFeedback = (state: RootState) => state.feedback.currentFeedback;

export default feedbackSlice.reducer;
