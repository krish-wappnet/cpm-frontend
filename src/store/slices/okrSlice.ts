import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../rootReducer';
import { okrApi } from '../../api/okrApi';
import type { 
  Okr, 
  CreateOkrDto, 
  UpdateOkrDto, 
  KeyResult, 
  CreateKeyResultDto, 
  UpdateKeyResultDto,
  KeyResultUpdate,
  CreateKeyResultUpdateDto,
  OkrFilterParams
} from '../../types/okr';
import type { PaginatedResponse } from '../../types/common';
import type { AxiosError } from 'axios';

interface ApiErrorResponse {
  message: string;
}

interface OKRState {
  okrs: Okr[];
  currentOKR: Okr | null;
  currentKeyResult: KeyResult | null;
  keyResultUpdates: KeyResultUpdate[];
  loading: boolean;
  error: string | null;
  total: number;
  filters: OkrFilterParams;
  completionRate: {
    total: number;
    completed: number;
    rate: number;
  } | null;
  userProgress: {
    activeOkrs: number;
    averageProgress: number;
    topPerformingOkr: Partial<Okr> | null;
  } | null;
}

const initialState: OKRState = {
  okrs: [],
  currentOKR: null,
  currentKeyResult: null,
  keyResultUpdates: [],
  loading: false,
  error: null,
  total: 0,
  filters: {
    page: 1,
    limit: 10,
  },
  completionRate: null,
  userProgress: null,
};

// Async thunks
export const fetchOKRs = createAsyncThunk<
  PaginatedResponse<Okr>,
  OkrFilterParams,
  { rejectValue: string }
>(
  'okrs/fetchOKRs',
  async (params: OkrFilterParams, { rejectWithValue }) => {
    try {
      return await okrApi.getOkrs(params);
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        apiError.response?.data?.message || 'Failed to fetch OKRs'
      );
    }
  }
);

export const fetchOKRById = createAsyncThunk(
  'okrs/fetchOKRById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await okrApi.getOkrById(id);
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        apiError.response?.data?.message || 'Failed to fetch OKR'
      );
    }
  }
);

export const createOKR = createAsyncThunk(
  'okrs/createOKR',
  async (okrData: CreateOkrDto, { rejectWithValue }) => {
    try {
      return await okrApi.createOkr(okrData);
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        apiError.response?.data?.message || 'Failed to create OKR'
      );
    }
  }
);

export const updateOKR = createAsyncThunk(
  'okrs/updateOKR',
  async (
    { id, okrData }: { id: string; okrData: UpdateOkrDto },
    { rejectWithValue }
  ) => {
    try {
      return await okrApi.updateOkr(id, okrData);
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        apiError.response?.data?.message || 'Failed to update OKR'
      );
    }
  }
);

export const deleteOKR = createAsyncThunk(
  'okrs/deleteOKR',
  async (id: string, { rejectWithValue }) => {
    try {
      await okrApi.deleteOkr(id);
      return id;
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        apiError.response?.data?.message || 'Failed to delete OKR'
      );
    }
  }
);

export const createKeyResult = createAsyncThunk(
  'okrs/createKeyResult',
  async (
    { okrId, data }: { okrId: string; data: Omit<CreateKeyResultDto, 'okrId'> },
    { rejectWithValue }
  ) => {
    try {
      return await okrApi.createKeyResult(okrId, data);
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        apiError.response?.data?.message || 'Failed to create key result'
      );
    }
  }
);

export const updateKeyResult = createAsyncThunk(
  'okrs/updateKeyResult',
  async (
    { id, data }: { id: string; data: UpdateKeyResultDto },
    { rejectWithValue }
  ) => {
    try {
      return await okrApi.updateKeyResult(id, data);
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        apiError.response?.data?.message || 'Failed to update key result'
      );
    }
  }
);

export const deleteKeyResult = createAsyncThunk(
  'okrs/deleteKeyResult',
  async (id: string, { rejectWithValue }) => {
    try {
      await okrApi.deleteKeyResult(id);
      return id;
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        apiError.response?.data?.message || 'Failed to delete key result'
      );
    }
  }
);

export const createKeyResultUpdate = createAsyncThunk(
  'okrs/createKeyResultUpdate',
  async (data: CreateKeyResultUpdateDto, { rejectWithValue }) => {
    try {
      return await okrApi.createKeyResultUpdate(data);
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        apiError.response?.data?.message || 'Failed to create key result update'
      );
    }
  }
);

export const fetchKeyResultUpdates = createAsyncThunk(
  'okrs/fetchKeyResultUpdates',
  async (keyResultId: string, { rejectWithValue }) => {
    try {
      return await okrApi.getKeyResultUpdates(keyResultId);
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        apiError.response?.data?.message || 'Failed to fetch key result updates'
      );
    }
  }
);

export const fetchCompletionRate = createAsyncThunk(
  'okrs/fetchCompletionRate',
  async (params: { userId?: string } = {}, { rejectWithValue }) => {
    try {
      return await okrApi.getCompletionRate(params.userId);
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        apiError.response?.data?.message || 'Failed to fetch completion rate'
      );
    }
  }
);

export const fetchUserProgress = createAsyncThunk(
  'okrs/fetchUserProgress',
  async (params: { userId: string }, { rejectWithValue }) => {
    try {
      return await okrApi.getUserProgress(params.userId);
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        apiError.response?.data?.message || 'Failed to fetch user progress'
      );
    }
  }
);

const okrSlice = createSlice({
  name: 'okrs',
  initialState,
  reducers: {
    clearCurrentOKR: (state) => {
      state.currentOKR = null;
    },
    clearCurrentKeyResult: (state) => {
      state.currentKeyResult = null;
    },
    clearKeyResultUpdates: (state) => {
      state.keyResultUpdates = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<Partial<OkrFilterParams>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 10,
      };
    },
  },
  extraReducers: (builder) => {
    // Handle loading state
    const handlePending = (state: OKRState) => {
      state.loading = true;
      state.error = null;
    };

    // Handle error state
    const handleRejected = (state: OKRState, action: PayloadAction<unknown>) => {
      state.loading = false;
      state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred';
    };

    // Handle success state for paginated responses
    const handlePaginatedFulfilled = (state: OKRState, action: PayloadAction<PaginatedResponse<Okr>>) => {
      state.loading = false;
      state.okrs = action.payload.items;
      state.total = action.payload.total;
    };

    // Handle success state for single item responses
    const handleSingleFulfilled = (state: OKRState, action: PayloadAction<Okr>) => {
      state.loading = false;
      state.currentOKR = action.payload;
    };

    builder
      // Fetch OKRs
      .addCase(fetchOKRs.pending, handlePending)
      .addCase(fetchOKRs.fulfilled, handlePaginatedFulfilled)
      .addCase(fetchOKRs.rejected, handleRejected)

      // Fetch OKR By Id
      .addCase(fetchOKRById.pending, handlePending)
      .addCase(fetchOKRById.fulfilled, handleSingleFulfilled)
      .addCase(fetchOKRById.rejected, handleRejected)

      // Create OKR
      .addCase(createOKR.pending, handlePending)
      .addCase(createOKR.fulfilled, handleSingleFulfilled)
      .addCase(createOKR.rejected, handleRejected)

      // Update OKR
      .addCase(updateOKR.pending, handlePending)
      .addCase(updateOKR.fulfilled, handleSingleFulfilled)
      .addCase(updateOKR.rejected, handleRejected)

      // Delete OKR
      .addCase(deleteOKR.pending, handlePending)
      .addCase(deleteOKR.fulfilled, (state) => {
        state.loading = false;
        state.currentOKR = null;
      })
      .addCase(deleteOKR.rejected, handleRejected)

      // Create Key Result
      .addCase(createKeyResult.pending, handlePending)
      .addCase(createKeyResult.fulfilled, (state, action: PayloadAction<KeyResult>) => {
        state.loading = false;
        state.currentKeyResult = action.payload;
      })
      .addCase(createKeyResult.rejected, handleRejected)

      // Update Key Result
      .addCase(updateKeyResult.pending, handlePending)
      .addCase(updateKeyResult.fulfilled, (state, action: PayloadAction<KeyResult>) => {
        state.loading = false;
        state.currentKeyResult = action.payload;
      })
      .addCase(updateKeyResult.rejected, handleRejected)

      // Delete Key Result
      .addCase(deleteKeyResult.pending, handlePending)
      .addCase(deleteKeyResult.fulfilled, (state) => {
        state.loading = false;
        state.currentKeyResult = null;
      })
      .addCase(deleteKeyResult.rejected, handleRejected)

      // Create Key Result Update
      .addCase(createKeyResultUpdate.pending, handlePending)
      .addCase(createKeyResultUpdate.fulfilled, (state, action: PayloadAction<KeyResultUpdate>) => {
        state.loading = false;
        state.keyResultUpdates.push(action.payload);
      })
      .addCase(createKeyResultUpdate.rejected, handleRejected)

      // Fetch Key Result Updates
      .addCase(fetchKeyResultUpdates.pending, handlePending)
      .addCase(fetchKeyResultUpdates.fulfilled, (state, action: PayloadAction<KeyResultUpdate[]>) => {
        state.loading = false;
        state.keyResultUpdates = action.payload;
      })
      .addCase(fetchKeyResultUpdates.rejected, handleRejected)

      // Fetch Completion Rate
      .addCase(fetchCompletionRate.pending, handlePending)
      .addCase(fetchCompletionRate.fulfilled, (state, action: PayloadAction<OKRState['completionRate']>) => {
        state.loading = false;
        state.completionRate = action.payload;
      })
      .addCase(fetchCompletionRate.rejected, handleRejected)

      // Fetch User Progress
      .addCase(fetchUserProgress.pending, handlePending)
      .addCase(fetchUserProgress.fulfilled, (state, action: PayloadAction<OKRState['userProgress']>) => {
        state.loading = false;
        state.userProgress = action.payload;
      })
      .addCase(fetchUserProgress.rejected, handleRejected);
  },
});

export type { OKRState };

export const { 
  clearCurrentOKR, 
  clearCurrentKeyResult, 
  clearKeyResultUpdates,
  clearError, 
  setFilters, 
  resetFilters 
} = okrSlice.actions;

// Selectors
export const selectOKRs = (state: RootState) => state.okrs.okrs;
export const selectCurrentOKR = (state: RootState) => state.okrs.currentOKR;
export const selectCurrentKeyResult = (state: RootState) => state.okrs.currentKeyResult;
export const selectKeyResultUpdates = (state: RootState) => state.okrs.keyResultUpdates;
export const selectOKRsLoading = (state: RootState) => state.okrs.loading;
export const selectOKRsError = (state: RootState) => state.okrs.error;
export const selectTotalOKRs = (state: RootState) => state.okrs.total;
export const selectOKRFilters = (state: RootState) => state.okrs.filters;
export const selectCompletionRate = (state: RootState) => state.okrs.completionRate;
export const selectUserProgress = (state: RootState) => state.okrs.userProgress;

// Memoized selectors
export const selectOKRById = (id?: string) => (state: RootState) =>
  id ? state.okrs.okrs.find(okr => okr.id === id) : null;

export const selectKeyResultById = (id?: string) => (state: RootState) => {
  if (!id || !state.okrs.currentOKR?.keyResults) return null;
  return state.okrs.currentOKR.keyResults.find(kr => kr.id === id) || null;
};

export const selectKeyResultWithUpdates = (id?: string) => (state: RootState) => {
  if (!id) return null;
  
  const keyResult = state.okrs.currentOKR?.keyResults?.find(kr => kr.id === id);
  if (!keyResult) return null;
  
  const updates = state.okrs.keyResultUpdates.filter(kru => kru.keyResultId === id);
  
  return {
    ...keyResult,
    updates,
  };
};

export default okrSlice.reducer;
