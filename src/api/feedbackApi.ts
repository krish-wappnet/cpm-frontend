import api from '../services/api';
import type { 
  FeedbackType, 
  FeedbackStatus, 
  RequestStatus, 
  CycleStatus
} from '../types/feedback.types';

// Helper function to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('No authentication token found');
    return { 'Content-Type': 'application/json' };
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department?: string;
  role?: string;
}

export interface FeedbackTemplate {
  id: string;
  name: string;
  description?: string;
  questions: Array<{
    id: string;
    text: string;
    type: 'rating' | 'text' | 'multiple_choice';
    options?: string[];
  }>;
}

export interface Feedback {
  id: string;
  type: FeedbackType;
  content: string;
  ratings: Record<string, number>;
  strengths?: string;
  improvements?: string;
  status: FeedbackStatus;
  cycleId?: string;
  fromUser: User;
  fromUserId: string;
  toUser: User;
  toUserId: string;
  requestId?: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackCycle {
  id: string;
  name: string;
  description?: string;
  type: string;
  startDate: string;
  endDate: string;
  status: CycleStatus;
  feedbackTemplates?: FeedbackTemplate[];
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackRequest {
  id: string;
  type: FeedbackType;
  message?: string;
  dueDate: string;
  status: RequestStatus;
  requester: User;
  requesterId: string;
  recipient: User;
  recipientId: string;
  subject: User;
  subjectId: string;
  cycleId?: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeedbackData {
  type: FeedbackType;
  content: string;
  ratings: Record<string, number>;
  strengths?: string;
  improvements?: string;
  toUserId: string;
  requestId?: string;
  cycleId?: string;
  isAnonymous: boolean;
}

export interface UpdateFeedbackData {
  content?: string;
  ratings?: Record<string, number>;
  strengths?: string;
  improvements?: string;
  status?: FeedbackStatus;
  isAnonymous?: boolean;
}

export interface CreateFeedbackCycleData {
  name: string;
  description?: string;
  type: string;
  startDate: string;
  endDate: string;
  feedbackTemplates?: FeedbackTemplate[];
}

export interface CreateFeedbackRequestData {
  type: FeedbackType;
  message?: string;
  dueDate: string;
  recipientId: string;
  subjectId: string;
  cycleId?: string;
  isAnonymous: boolean;
}

export interface UpdateFeedbackRequestData {
  message?: string;
  dueDate?: string;
  status?: RequestStatus;
  isAnonymous?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Feedback endpoints
export const getFeedbackList = async (params?: {
  fromUserId?: string;
  toUserId?: string;
  type?: FeedbackType;
  status?: FeedbackStatus;
  cycleId?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Feedback>> => {
  const response = await api.get('/feedback', { params });
  return response.data;
};

export const getFeedbackById = async (id: string): Promise<Feedback> => {
  const response = await api.get(`/feedback/${id}`);
  return response.data;
};

export const createFeedback = async (data: CreateFeedbackData): Promise<Feedback> => {
  const response = await api.post('/feedback', data);
  return response.data;
};

export const updateFeedback = async (id: string, data: UpdateFeedbackData): Promise<Feedback> => {
  const response = await api.patch(`/feedback/${id}`, data);
  return response.data;
};

export const deleteFeedback = async (id: string): Promise<void> => {
  await api.delete(`/feedback/${id}`);
};

// Feedback Cycle endpoints
export const getFeedbackCycles = async (params?: {
  status?: CycleStatus;
  type?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<FeedbackCycle>> => {
  const response = await api.get('/feedback/cycles', { params });
  return response.data;
};

export const getFeedbackCycleById = async (id: string): Promise<FeedbackCycle> => {
  const response = await api.get(`/feedback/cycles/${id}`);
  return response.data;
};

export const createFeedbackCycle = async (data: CreateFeedbackCycleData): Promise<FeedbackCycle> => {
  const response = await api.post('/feedback/cycles', data);
  return response.data;
};

export const updateFeedbackCycle = async (id: string, data: Partial<CreateFeedbackCycleData>): Promise<FeedbackCycle> => {
  const response = await api.patch(`/feedback/cycles/${id}`, data);
  return response.data;
};

export const deleteFeedbackCycle = async (id: string): Promise<void> => {
  await api.delete(`/feedback/cycles/${id}`);
};

// Feedback Request endpoints
export interface FeedbackRequestParams {
  requesterId?: string;
  recipientId?: string;
  subjectId?: string;
  status?: RequestStatus;
  cycleId?: string;
  page?: number;
  limit?: number;
}

export const getFeedbackRequests = async (
  params: FeedbackRequestParams = { page: 1, limit: 10 }
): Promise<PaginatedResponse<FeedbackRequest>> => {
  try {
    console.log('Fetching feedback requests with params:', params);
    
    const response = await api.get('/feedback/requests', { 
      params: {
        page: 1,
        limit: 10,
        ...params
      },
      headers: getAuthHeaders()
    });
    
    console.log('Feedback requests response:', response.data);
    
    if (!response.data) {
      return { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    }
    
    return {
      items: response.data.items || [],
      total: response.data.total || 0,
      page: response.data.page || 1,
      limit: response.data.limit || 10,
      totalPages: response.data.totalPages || 1
    };
  } catch (error) {
    console.error('Error fetching feedback requests:', error);
    return { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
  }
};

export const getFeedbackRequestById = async (id: string): Promise<FeedbackRequest> => {
  const response = await api.get(`/feedback/requests/${id}`);
  return response.data;
};

export const createFeedbackRequest = async (data: CreateFeedbackRequestData): Promise<FeedbackRequest> => {
  const response = await api.post('/feedback/requests', data);
  return response.data;
};

export const updateFeedbackRequest = async (id: string, data: UpdateFeedbackRequestData): Promise<FeedbackRequest> => {
  const response = await api.patch(`/feedback/requests/${id}`, data);
  return response.data;
};

export interface RespondToFeedbackRequestResponse {
  success: boolean;
  message: string;
  data?: FeedbackRequest;
}

export const approveFeedbackRequest = async (
  id: string
): Promise<RespondToFeedbackRequestResponse> => {
  try {
    const payload = {
      status: 'approved' as const,
      isAnonymous: false
    };
    
    const response = await api.patch<RespondToFeedbackRequestResponse>(
      `/feedback/requests/${id}`,
      payload,
      { 
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.data) {
      throw new Error('No response data received');
    }
    
    return {
      success: true,
      message: 'Feedback request approved successfully',
      data: response.data.data
    };
  } catch (error: unknown) {
    console.error('Error approving feedback request:', error);
    const errorMessage = 
      error instanceof Error ? error.message :
      typeof error === 'object' && error !== null && 'response' in error && 
      typeof error.response === 'object' && error.response !== null && 
      'data' in error.response && 
      typeof error.response.data === 'object' && error.response.data !== null && 
      'message' in error.response.data && 
      typeof error.response.data.message === 'string' ? error.response.data.message :
      'Failed to approve feedback request. Please try again.';
    throw new Error(errorMessage);
  }
};

export const deleteFeedbackRequest = async (id: string): Promise<void> => {
  await api.delete(`/feedback/requests/${id}`);
};

// 360 Feedback endpoints
export interface Generate360FeedbackResponse {
  success: boolean;
  message: string;
  requests: FeedbackRequest[];
}

export const generate360Feedback = async (
  userId: string, 
  cycleId: string, 
  recipientIds: string[]
): Promise<Generate360FeedbackResponse> => {
  const response = await api.post(`/feedback/360/${userId}?cycleId=${cycleId}`, { recipientIds });
  return response.data;
};

export interface Feedback360Summary {
  userId: string;
  cycleId: string;
  averageRatings: Record<string, number>;
  totalFeedbacks: number;
  completedFeedbacks: number;
  pendingFeedbacks: number;
}

export const get360FeedbackSummary = async (
  userId: string, 
  cycleId?: string
): Promise<Feedback360Summary> => {
  const response = await api.get(`/feedback/360/${userId}/summary${cycleId ? `?cycleId=${cycleId}` : ''}`);
  return response.data;
};

// Analytics endpoints
export interface FeedbackStats {
  totalFeedbacks: number;
  completedFeedbacks: number;
  pendingFeedbacks: number;
  averageRating: number;
  ratingsByCategory: Record<string, number>;
}

export const getFeedbackStats = async (userId?: string): Promise<FeedbackStats> => {
  const response = await api.get('/feedback/analytics/stats', { params: { userId } });
  return response.data;
};

export interface AverageRatings {
  userId: string;
  ratings: Record<string, number>;
  overallAverage: number;
}

export const getAverageRatings = async (userId: string): Promise<AverageRatings> => {
  const response = await api.get(`/feedback/analytics/ratings/${userId}`);
  return response.data;
};
