import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LoginResponse } from '../../services/authService';

interface AuthState {
  user: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<LoginResponse>) {
      state.loading = false;
      state.user = action.payload.data.user;
      state.accessToken = action.payload.data.accessToken;
      state.refreshToken = action.payload.data.refreshToken || null;
      state.error = null;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
    },
    updateTokens(state, action: PayloadAction<{ accessToken: string; refreshToken?: string }>) {
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateTokens } = authSlice.actions;
export default authSlice.reducer;
