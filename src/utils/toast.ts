import { toast, type ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Default toast configuration
const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

// Success toast
export const showSuccess = (message: string, options: ToastOptions = {}) => {
  toast.success(message, {
    ...defaultOptions,
    ...options,
    className: 'toast-success',
  });
};

// Error toast
export const showError = (message: string, options: ToastOptions = {}) => {
  toast.error(message, {
    ...defaultOptions,
    ...options,
    autoClose: 5000, // Longer display for errors
    className: 'toast-error',
  });
};

// Warning toast
export const showWarning = (message: string, options: ToastOptions = {}) => {
  toast.warning(message, {
    ...defaultOptions,
    ...options,
    className: 'toast-warning',
  });
};

// Info toast
export const showInfo = (message: string, options: ToastOptions = {}) => {
  toast.info(message, {
    ...defaultOptions,
    ...options,
    className: 'toast-info',
  });
};

// Default export with all toast functions
const toastUtils = {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  dismiss: toast.dismiss,
  clearWaitingQueue: toast.clearWaitingQueue,
  isActive: toast.isActive,
};

export default toastUtils;
