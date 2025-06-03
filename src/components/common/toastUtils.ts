import { message, notification } from 'antd';

// Configure message defaults
message.config({
  duration: 3,
  maxCount: 3,
});

// Configure notification defaults
notification.config({
  duration: 4.5,
  maxCount: 3,
});

const showToast = (type: 'success' | 'error' | 'warning' | 'info' | 'loading', content: string, duration?: number) => {
  message[type](content, duration);
};

const showNotification = (
  type: 'success' | 'error' | 'warning' | 'info',
  title: string,
  content: string,
  duration?: number
) => {
  notification[type]({
    message: title,
    description: content,
    duration,
  });
};

export const toastUtils = {
  success: (content: string, duration?: number) => {
    showToast('success', content, duration);
  },

  error: (content: string, duration?: number) => {
    showToast('error', content, duration);
  },

  warning: (content: string, duration?: number) => {
    showToast('warning', content, duration);
  },

  info: (content: string, duration?: number) => {
    showToast('info', content, duration);
  },

  loading: (content: string, duration?: number) => {
    showToast('loading', content, duration);
  },

  destroy: () => {
    message.destroy();
  },

  notificationSuccess: (title: string, content: string, duration?: number) => {
    showNotification('success', title, content, duration);
  },

  notificationError: (title: string, content: string, duration?: number) => {
    showNotification('error', title, content, duration);
  },

  notificationWarning: (title: string, content: string, duration?: number) => {
    showNotification('warning', title, content, duration);
  },

  notificationInfo: (title: string, content: string, duration?: number) => {
    showNotification('info', title, content, duration);
  },

  notificationDestroy: () => {
    notification.destroy();
  },
}; 