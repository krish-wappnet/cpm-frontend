import { AxiosInstance } from 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

declare const api: AxiosInstance;

export default api;
