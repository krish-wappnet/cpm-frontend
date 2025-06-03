import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import type { PersistPartial } from 'redux-persist/es/persistReducer';
import type { AnyAction } from 'redux';
import type { Reducer } from '@reduxjs/toolkit';
import { useDispatch, type TypedUseSelectorHook, useSelector } from 'react-redux';

import authReducer from './slices/authSlice';
import usersReducer from './slices/userSlice';
import okrsReducer from './slices/okrSlice';
import kpisReducer from './slices/kpiSlice';
import feedbackReducer from './slices/feedbackSlice';

// Import types from their respective slices
import type { User as AuthUser } from './slices/authSlice';
import type { User as UserStateUser } from './slices/userSlice';

// Define the auth state type
interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Define other state types based on their slice implementations
interface UserState {
  users: UserStateUser[];
  currentUser: UserStateUser | null;
  loading: boolean;
  error: string | null;
  total: number;
  filters: {
    page: number;
    limit: number;
    search?: string;
  };
}

interface OKRState {
  okrs: any[]; // Replace with actual OKR type when available
  currentOKR: any | null;
  currentKeyResult: any | null;
  keyResultUpdates: any[];
  loading: boolean;
  error: string | null;
  total: number;
  filters: any;
  completionRate: {
    total: number;
    completed: number;
    rate: number;
  } | null;
  userProgress: {
    activeOkrs: number;
    averageProgress: number;
    topPerformingOkr: any | null;
  } | null;
}

interface KpiState {
  kpis: any[];
  currentKpi: any | null;
  loading: boolean;
  error: string | null;
  total: number;
  filters: any;
  kpiUpdates: any[];
  categories: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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
  feedbacks: any[]; // Replace with actual Feedback type when available
  currentFeedback: any | null;
}

const rootReducer = combineReducers({
  auth: authReducer,
  users: usersReducer,
  okrs: okrsReducer,
  kpis: kpisReducer,
  feedback: feedbackReducer,
});

export type RootState = {
  auth: AuthState & PersistPartial;
  users: UserState;
  okrs: OKRState;
  kpis: KpiState;
  feedback: FeedbackState;
};

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
};

// Cast the reducer to unknown first to avoid type mismatch
const persistedReducer = persistReducer(
  persistConfig,
  rootReducer as unknown as Reducer<RootState, AnyAction>
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: import.meta.env.DEV,
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type AppGetState = typeof store.getState;

// Typed hooks for use throughout the app
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
