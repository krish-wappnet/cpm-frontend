import { useState, useCallback } from 'react';

export const useModal = <T = unknown>(initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((modalData?: T) => {
    setData(modalData || null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Don't reset data immediately to allow for smooth closing animations
    setTimeout(() => setData(null), 300);
  }, []);

  return {
    isOpen,
    open,
    close,
    data,
  };
};
