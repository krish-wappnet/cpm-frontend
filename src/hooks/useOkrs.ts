import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';
import { fetchOKRs, setFilters, resetFilters, deleteOKR } from '../store/slices/okrSlice';
import { okrApi } from '../api/okrApi';
import type { OkrFilterParams } from '../types/okr';

export const useOkrs = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const okrs = useSelector((state: RootState) => state.okrs.okrs);
  const filters = useSelector((state: RootState) => state.okrs.filters);
  const total = useSelector((state: RootState) => state.okrs.total);
  
  const loadOkrs = useCallback(async (params?: Partial<OkrFilterParams>) => {
    try {
      setLoading(true);
      setError(null);
      await dispatch(fetchOKRs({ ...filters, ...params })).unwrap();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load OKRs');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dispatch, filters]);
  
  const updateFilters = useCallback((newFilters: Partial<OkrFilterParams>) => {
    dispatch(setFilters({ ...filters, ...newFilters, page: 1 }));
  }, [dispatch, filters]);
  
  const resetAllFilters = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);
  
  const removeOkr = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await dispatch(deleteOKR(id)).unwrap();
      await loadOkrs();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete OKR');
      return false;
    } finally {
      setLoading(false);
    }
  }, [dispatch, loadOkrs]);
  
  return {
    okrs,
    loading,
    error,
    filters,
    total,
    loadOkrs,
    updateFilters,
    resetFilters: resetAllFilters,
    deleteOkr: removeOkr,
  };
};

export const useOkr = (id: string) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const okr = useSelector((state: RootState) => 
    state.okrs.okrs.find(o => o.id === id)
  );
  
  const loadOkr = useCallback(async () => {
    if (!okr) {
      try {
        setLoading(true);
        setError(null);
        const data = await okrApi.getOkrById(id);
        dispatch({ type: 'okrs/setOkr', payload: data });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load OKR');
        throw err;
      } finally {
        setLoading(false);
      }
    }
  }, [dispatch, id, okr]);
  
  return {
    okr,
    loading,
    error,
    loadOkr,
  };
};
