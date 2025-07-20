import apiService from './api.service';
import {
  User,
  LoginCredentials,
  LoginResponse,
  RefreshTokenResponse,
} from '../types/auth.types';
import { ApiResponse } from '../types/gallery.types';

class AuthApiService {
  private readonly baseUrl = '/auth';

  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    return apiService.post<ApiResponse<LoginResponse>>(`${this.baseUrl}/login`, credentials);
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<ApiResponse<User>> {
    return apiService.post<ApiResponse<User>>(`${this.baseUrl}/register`, userData);
  }

  async logout(): Promise<void> {
    try {
      await apiService.post(`${this.baseUrl}/logout`);
    } catch (error) {
      // Handle logout error if needed
      console.error('Logout error:', error);
    }
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<RefreshTokenResponse>> {
    return apiService.post<ApiResponse<RefreshTokenResponse>>(`${this.baseUrl}/refresh`, {
      refresh_token: refreshToken,
    });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiService.get<ApiResponse<User>>(`${this.baseUrl}/me`);
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return apiService.post<ApiResponse<void>>(`${this.baseUrl}/forgot-password`, { email });
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse<void>> {
    return apiService.post<ApiResponse<void>>(`${this.baseUrl}/reset-password`, {
      token,
      password,
    });
  }
}

export const authApiService = new AuthApiService();
export default authApiService;
