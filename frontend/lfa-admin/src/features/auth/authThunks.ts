import { createAsyncThunk } from '@reduxjs/toolkit';
import { login, LoginPayload } from '../../services/authService';

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await login(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);
