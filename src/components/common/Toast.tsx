import { toastUtils } from './toastUtils.ts';

// Export toast utilities as components for React Fast Refresh
export const Toast = {
  success: toastUtils.success,
  error: toastUtils.error,
  warning: toastUtils.warning,
  info: toastUtils.info,
  loading: toastUtils.loading,
  destroy: toastUtils.destroy,
} as const;

export const Notification = {
  success: toastUtils.notificationSuccess,
  error: toastUtils.notificationError,
  warning: toastUtils.notificationWarning,
  info: toastUtils.notificationInfo,
  destroy: toastUtils.notificationDestroy,
} as const;
