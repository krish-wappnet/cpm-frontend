import api from '../services/api';
import type { User } from '../types/user';

// User endpoints
export const getUsers = async (params?: {
  search?: string;
  department?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/users', { params });
  return response.data;
};

export const getUserById = async (id: string) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const getManagers = async (search: string = ''): Promise<User[]> => {
  // Always include search parameter, even if empty
  const response = await api.get('/users/managers', { 
    params: { search: search || '' } 
  });
  return response.data;
};

export const getDepartments = async (): Promise<string[]> => {
  const response = await api.get('/users/departments');
  return response.data;
};

export const updateUser = async (id: string, data: Partial<User>) => {
  const response = await api.patch(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: string) => {
  await api.delete(`/users/${id}`);
};
