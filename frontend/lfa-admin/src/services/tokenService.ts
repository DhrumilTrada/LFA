import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { toastError, toastSuccess } from './toastService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Helper function to get stored tokens
const getStoredTokens = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return {
          accessToken: user?.access || null,
          refreshToken: user?.refresh || null,
        };
      } catch {
        return { accessToken: null, refreshToken: null };
      }
    }
  }
  return { accessToken: null, refreshToken: null };
};

// Helper function to update stored tokens
const updateStoredTokens = (accessToken: string, refreshToken?: string) => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        user.access = accessToken;
        if (refreshToken) {
          user.refresh = refreshToken;
        }
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('Error updating stored tokens:', error);
      }
    }
  }
};

// Helper function to clear stored tokens
const clearStoredTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    // Redirect to login page
    window.location.href = '/admin/login';
  }
};

// Function to refresh the access token
const refreshAccessToken = async (): Promise<string> => {
  const { refreshToken } = getStoredTokens();
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      {
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        withCredentials: true,
      }
    );

    const newAccessToken = response.data.data.accessToken;
    const newRefreshToken = response.data.data.refreshToken;
    
    // Update stored tokens
    updateStoredTokens(newAccessToken, newRefreshToken);
    
    // Show success toast (optional - you may want to remove this for silent refresh)
    // toastSuccess.tokenRefreshSuccess();
    
    return newAccessToken;
  } catch (error) {
    // If refresh fails, clear tokens and redirect to login
    toastError.tokenRefreshError();
    clearStoredTokens();
    throw error;
  }
};

// Create axios instance with interceptors
export const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
  });

  // Request interceptor to add auth header
  instance.interceptors.request.use(
    (config) => {
      const { accessToken } = getStoredTokens();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle 401 errors and refresh tokens
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      // Handle network errors
      if (!error.response) {
        toastError.networkError();
        return Promise.reject(error);
      }

      // Handle server errors (5xx)
      if (error.response.status >= 500) {
        toastError.serverError();
        return Promise.reject(error);
      }

      // Handle unauthorized errors (401)
      if (error.response?.status === 401 && !originalRequest._retry) {
        // Skip refresh for login endpoint
        if (originalRequest.url?.includes('/auth/login')) {
          return Promise.reject(error);
        }

        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return instance(originalRequest);
          }).catch((err) => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newAccessToken = await refreshAccessToken();
          processQueue(null, newAccessToken);
          
          // Retry the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          
          return instance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          clearStoredTokens();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Default axios instance
export const axiosInstance = createAxiosInstance();

// Export individual functions for manual use
export {
  refreshAccessToken,
  getStoredTokens,
  updateStoredTokens,
  clearStoredTokens,
};
