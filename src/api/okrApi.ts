import api from '../services/api';
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
} from '../types/okr';
import type { PaginatedResponse } from '../types/common';

const API_URL = '/okrs';

export const okrApi = {
  // OKR endpoints
  getOkrs: async (params?: OkrFilterParams): Promise<PaginatedResponse<Okr>> => {
    const response = await api.get(API_URL, { params });
    return response.data;
  },

  getOkrById: async (id: string): Promise<Okr> => {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data;
  },

  createOkr: async (data: CreateOkrDto): Promise<Okr> => {
    console.log('Creating OKR with data:', JSON.stringify(data, null, 2));
    console.log('Sending POST request to:', API_URL);
    try {
      const response = await api.post(API_URL, data);
      console.log('OKR created successfully:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('Error creating OKR:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: unknown; status: number; headers: unknown } };
        console.error('Response data:', axiosError.response.data);
        console.error('Response status:', axiosError.response.status);
        console.error('Response headers:', axiosError.response.headers);
      } else if (error && typeof error === 'object' && 'request' in error) {
        console.error('No response received:', (error as { request: unknown }).request);
      } else if (error instanceof Error) {
        console.error('Error setting up request:', error.message);
      }
      throw error;
    }
  },

  updateOkr: async (id: string, data: UpdateOkrDto): Promise<Okr> => {
    const response = await api.patch(`${API_URL}/${id}`, data);
    return response.data;
  },

  deleteOkr: async (id: string): Promise<void> => {
    await api.delete(`${API_URL}/${id}`);
  },

  // Key Result endpoints
  createKeyResult: async (okrId: string, data: Omit<CreateKeyResultDto, 'okrId'>): Promise<KeyResult> => {
    const response = await api.post(`${API_URL}/${okrId}/key-results`, data);
    return response.data;
  },

  updateKeyResult: async (id: string, data: UpdateKeyResultDto): Promise<KeyResult> => {
    const response = await api.patch(`${API_URL}/key-results/${id}`, data);
    return response.data;
  },

  deleteKeyResult: async (id: string): Promise<void> => {
    await api.delete(`${API_URL}/key-results/${id}`);
  },

  // Key Result Update endpoints
  createKeyResultUpdate: async (data: CreateKeyResultUpdateDto): Promise<KeyResultUpdate> => {
    const response = await api.post(`${API_URL}/key-results/updates`, data);
    return response.data;
  },

  getKeyResultUpdates: async (keyResultId: string): Promise<KeyResultUpdate[]> => {
    const response = await api.get(`${API_URL}/key-results/${keyResultId}/updates`);
    return response.data;
  },

  // Analytics endpoints
  getCompletionRate: async (userId?: string) => {
    const response = await api.get(`${API_URL}/analytics/completion-rate`, {
      params: { userId }
    });
    return response.data;
  },

  getUserProgress: async (userId: string) => {
    const response = await api.get(`${API_URL}/analytics/user-progress/${userId}`);
    return response.data;
  },
};
