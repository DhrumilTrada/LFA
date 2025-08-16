import { axiosInstance, clearStoredTokens } from './tokenService';
import { toastSuccess, toastError } from './toastService';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  data: {
    accessToken: string;
    refreshToken?: string;
    user: any;
  };
}

export interface RefreshTokenResponse {
  data: {
    accessToken: string;
    refreshToken?: string;
  };
}

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  try {
    const response = await axiosInstance.post(
      '/auth/login',
      payload,
      {
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
    toastSuccess.loginSuccess();
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Login failed';
    toastError.loginError(errorMessage);
    throw error;
  }
};

export const refreshToken = async (refreshTokenValue: string): Promise<RefreshTokenResponse> => {
  const response = await axiosInstance.post(
    '/auth/refresh',
    { refreshToken: refreshTokenValue },
    {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    }
  );
  return response.data;
};

export const logout = async (): Promise<void> => {
  try {
    await axiosInstance.post('/auth/logout');
    toastSuccess.logoutSuccess();
  } catch (error) {
    console.error('Logout error:', error);
    toastError.logoutError();
  } finally {
    clearStoredTokens();
  }
};

export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get('/auth/user');
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to load user profile';
    toastError.error('Failed to load profile', errorMessage);
    throw error;
  }
};
