import { createAsyncThunk } from '@reduxjs/toolkit';
import { login, LoginPayload, logout as logoutService, getUserProfile } from '../../services/authService';
import { updateStoredTokens, clearStoredTokens } from '../../services/tokenService';

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await login(payload);
      
      // Store tokens in localStorage
      const user = {
        ...response.data.user,
        access: response.data.accessToken,
        refresh: response.data.refreshToken,
      };
      localStorage.setItem('user', JSON.stringify(user));
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutService();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const getUserProfileThunk = createAsyncThunk(
  'auth/getUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserProfile();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user profile');
    }
  }
);
