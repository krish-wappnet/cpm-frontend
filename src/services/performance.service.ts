import api from './api';
import type { PaginatedResponse } from '../types/common';
import type { 
  PerformanceReview, 
  CreatePerformanceReviewDto, 
  UpdatePerformanceReviewDto 
} from '../types/performance';

export const getPerformanceReviews = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  userId?: string;
}) => {
  const response = await api.get<PaginatedResponse<PerformanceReview>>('/performance/reviews', { params });
  return response.data;
};

export const getMyPerformanceReviews = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
}) => {
  const response = await api.get<PaginatedResponse<PerformanceReview>>('/performance/reviews/me', { params });
  return response.data;
};

export const getPerformanceReview = async (id: string) => {
  const response = await api.get<PerformanceReview>(`/performance/reviews/${id}`);
  return response.data;
};

export const createPerformanceReview = async (data: CreatePerformanceReviewDto) => {
  const response = await api.post<PerformanceReview>('/performance/reviews', data);
  return response.data;
};

export const updatePerformanceReview = async (id: string, data: UpdatePerformanceReviewDto) => {
  const response = await api.patch<PerformanceReview>(`/performance/reviews/${id}`, data);
  return response.data;
};

export const submitReview = async (id: string) => {
  const response = await api.post<PerformanceReview>(`/performance/reviews/${id}/submit`);
  return response.data;
};

export const deletePerformanceReview = async (id: string) => {
  await api.delete(`/performance/reviews/${id}`);
};