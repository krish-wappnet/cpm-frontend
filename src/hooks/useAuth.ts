import { useSelector } from 'react-redux';
import { selectAuthUser, selectAuthLoading, selectAuthError } from '../store/slices/authSlice';

// Auth state is defined in the store

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles?: string[];
}

export const useAuth = () => {
  const user = useSelector(selectAuthUser);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = !!user;

  return {
    isAuthenticated,
    user,
    loading,
    error,
    isAdmin: user?.roles?.includes('ADMIN') || false,
  };
};
